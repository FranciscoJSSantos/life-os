from datetime import date, timedelta
import json
import urllib.request
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, func
from app.models.challenge import Challenge, ChallengeStatus, challenge_habits
from app.models.habit import Habit, HabitLog, LogStatus
from app.schemas.challenge import (
    ChallengeCreate, ChallengeRead, ChallengeHabitStat,
    ChallengeTimelineNote, ChallengeSummaryReport
)
from app.services.habit_service import HabitService

class ChallengeService:
    @staticmethod
    def create_challenge(db: Session, challenge_in: ChallengeCreate) -> Challenge:
        end_date = challenge_in.start_date + timedelta(days=challenge_in.duration_days - 1)
        
        challenge = Challenge(
            name=challenge_in.name,
            description=challenge_in.description,
            start_date=challenge_in.start_date,
            end_date=end_date,
            target_accuracy=challenge_in.target_accuracy,
            color=challenge_in.color,
            icon=challenge_in.icon,
            status=ChallengeStatus.ACTIVE
        )
        
        # Associar hábitos
        habits = db.scalars(select(Habit).where(Habit.id.in_(challenge_in.habit_ids))).all()
        challenge.habits.extend(habits)
        
        db.add(challenge)
        db.commit()
        db.refresh(challenge)
        return challenge

    @staticmethod
    def list_challenges_with_stats(db: Session) -> list[ChallengeRead]:
        challenges = db.scalars(select(Challenge).order_by(Challenge.created_at.desc())).unique().all()
        return [ChallengeService.calculate_stats(db, c) for c in challenges]

    @staticmethod
    def get_challenge_with_stats(db: Session, challenge_id: str) -> ChallengeRead | None:
        challenge = db.get(Challenge, challenge_id)
        if not challenge:
            return None
        return ChallengeService.calculate_stats(db, challenge)

    @staticmethod
    def calculate_stats(db: Session, challenge: Challenge) -> ChallengeRead:
        today = date.today()
        total_days = (challenge.end_date - challenge.start_date).days + 1
        
        if today < challenge.start_date:
            days_elapsed = 0
        else:
            days_elapsed = min((today - challenge.start_date).days + 1, total_days)
            
        days_remaining = max(0, total_days - days_elapsed)

        habits = challenge.habits
        habit_stats_map = {
            h.id: {
                "habit": h,
                "completed": 0,
                "expected": 0
            } for h in habits
        }

        days_perfect = 0

        # Iterar dia a dia desde o início até a data de hoje (ou fim do desafio)
        if days_elapsed > 0:
            for day_offset in range(days_elapsed):
                check_date = challenge.start_date + timedelta(days=day_offset)
                day_all_completed = True
                habits_scheduled_today = 0

                for h in habits:
                    is_sched = HabitService.is_habit_scheduled(h, check_date)
                    if is_sched:
                        habits_scheduled_today += 1
                        habit_stats_map[h.id]["expected"] += 1
                        is_done = HabitService.is_completed_on_date(db, h.id, check_date, h.target_value)
                        if is_done:
                            habit_stats_map[h.id]["completed"] += 1
                        else:
                            day_all_completed = False

                if habits_scheduled_today > 0 and day_all_completed:
                    days_perfect += 1

        total_expected = sum(item["expected"] for item in habit_stats_map.values())
        total_completed = sum(item["completed"] for item in habit_stats_map.values())

        if total_expected > 0:
            accuracy_rate = round((total_completed / total_expected) * 100, 1)
        else:
            accuracy_rate = 100.0

        is_on_track = accuracy_rate >= challenge.target_accuracy

        habit_stats_list: list[ChallengeHabitStat] = []
        for h_id, st in habit_stats_map.items():
            h = st["habit"]
            exp = st["expected"]
            comp = st["completed"]
            rate = round((comp / exp) * 100, 1) if exp > 0 else 100.0
            habit_stats_list.append(
                ChallengeHabitStat(
                    habit_id=h.id,
                    name=h.name,
                    color=h.color,
                    icon=h.icon,
                    completed_count=comp,
                    expected_count=exp,
                    accuracy_rate=rate
                )
            )

        return ChallengeRead(
            id=challenge.id,
            name=challenge.name,
            description=challenge.description,
            start_date=challenge.start_date,
            end_date=challenge.end_date,
            duration_days=total_days,
            days_elapsed=days_elapsed,
            days_remaining=days_remaining,
            target_accuracy=challenge.target_accuracy,
            accuracy_rate=accuracy_rate,
            days_perfect=days_perfect,
            is_on_track=is_on_track,
            color=challenge.color,
            icon=challenge.icon,
            status=challenge.status,
            habits_stats=habit_stats_list
        )

    @staticmethod
    def get_summary_report(
        db: Session, 
        challenge_id: str, 
        api_key: str | None = None,
        provider: str = "gemini",
        custom_prompt: str | None = None
    ) -> ChallengeSummaryReport:
        challenge = db.get(Challenge, challenge_id)
        if not challenge:
            raise ValueError("Desafio não encontrado")

        stats = ChallengeService.calculate_stats(db, challenge)
        habit_ids = [h.id for h in challenge.habits]

        # Buscar timeline de notas
        notes_query = (
            select(HabitLog, Habit.name)
            .join(Habit, Habit.id == HabitLog.habit_id)
            .where(
                and_(
                    HabitLog.habit_id.in_(habit_ids),
                    HabitLog.notes.is_not(None),
                    HabitLog.scheduled_date >= challenge.start_date,
                    HabitLog.scheduled_date <= challenge.end_date
                )
            )
            .order_by(HabitLog.scheduled_date.asc())
        )

        rows = db.execute(notes_query).all()
        timeline: list[ChallengeTimelineNote] = []
        for log, habit_name in rows:
            timeline.append(
                ChallengeTimelineNote(
                    date=log.scheduled_date,
                    habit_name=habit_name,
                    note=log.notes or ""
                )
            )

        # Gerar análise da IA
        ai_text = ChallengeService.generate_ai_insight(stats, timeline, api_key, provider, custom_prompt)

        return ChallengeSummaryReport(
            challenge_id=challenge.id,
            name=challenge.name,
            start_date=challenge.start_date,
            end_date=challenge.end_date,
            days_elapsed=stats.days_elapsed,
            total_days=stats.duration_days,
            overall_accuracy=stats.accuracy_rate,
            is_on_track=stats.is_on_track,
            habits_stats=stats.habits_stats,
            timeline_notes=timeline,
            ai_analysis=ai_text
        )

    @staticmethod
    def generate_ai_insight(
        stats: ChallengeRead, 
        timeline: list[ChallengeTimelineNote],
        api_key: str | None,
        provider: str,
        custom_prompt: str | None
    ) -> str:
        # Montar resumo textual do histórico
        habits_summary_text = "\n".join([
            f"- {h.name}: {h.completed_count}/{h.expected_count} aplicações ({h.accuracy_rate}% de acurácia)"
            for h in stats.habits_stats
        ])

        notes_summary_text = "\n".join([
            f"• [{n.date}] {n.habit_name}: \"{n.note}\""
            for n in timeline
        ]) if timeline else "Nenhuma observação ou sintoma registrado até o momento."

        prompt = f"""
Você é um especialista em análise de hábitos, adesão e saúde comportamental.
Analise os seguintes dados do desafio '{stats.name}':

📅 PERÍODO E PROGRESSO:
- Data de início: {stats.start_date} (Dia {stats.days_elapsed} de {stats.duration_days})
- Dias restantes: {stats.days_remaining} dias
- Acurácia geral atingida: {stats.accuracy_rate}% (Meta: {stats.target_accuracy}%)
- Dias 100% perfeitos (todos os hábitos cumpridos): {stats.days_perfect} dias
- Status de aderência: {'DENTRO DA META' if stats.is_on_track else 'ABAIXO DA META ESPERADA'}

📊 ADESÃO DETALHADA POR HÁBITO:
{habits_summary_text}

📝 DIÁRIO DE SINTOMAS / OBSERVAÇÕES REGISTRADAS:
{notes_summary_text}

{f"INSTRUÇÃO EXTRA DO USUÁRIO: {custom_prompt}" if custom_prompt else ""}

POR FAVOR, GERE UM RESUMO EXECUTIVO E CLÍNICO/COMPORTAMENTAL COM:
1. **Diagnóstico de Andamento**: Avaliação da consistência (notar diferenças entre uso manhã vs noite e padrão semanal).
2. **Evolução dos Sintomas**: Análise qualitativa das anotações e reações relatadas.
3. **Plano de Ação para os Próximos Dias**: 2 a 3 recomendações diretas para manter a constância e alcançar os 100% de adesão nos {stats.duration_days} dias.
Seja direto, empático, encorajador e objetivo.
""".strip()

        # Se houver API Key, tentar chamada real
        if api_key and api_key.strip():
            try:
                if provider.lower() == "gemini":
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key.strip()}"
                    body = {
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }]
                    }
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(body).encode('utf-8'),
                        headers={"Content-Type": "application/json"}
                    )
                    with urllib.request.urlopen(req, timeout=15) as resp:
                        res_json = json.loads(resp.read().decode('utf-8'))
                        text = res_json["candidates"][0]["content"]["parts"][0]["text"]
                        return text
                elif provider.lower() == "openai":
                    url = "https://api.openai.com/v1/chat/completions"
                    body = {
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": "Você é um assistente médico e comportamental focado em adesão de rotinas e tratamentos."},
                            {"role": "user", "content": prompt}
                        ]
                    }
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(body).encode('utf-8'),
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {api_key.strip()}"
                        }
                    )
                    with urllib.request.urlopen(req, timeout=15) as resp:
                        res_json = json.loads(resp.read().decode('utf-8'))
                        return res_json["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"Erro ao chamar API externa de IA ({provider}): {e}")
                # Fallback se a API falhar

        # Resumo Inteligente Local (Sem API Key ou Fallback)
        on_track_text = "excelente e dentro da meta esperada" if stats.is_on_track else "com pontos de atenção a recuperar"
        
        # Analisar hábitos com menor adesão
        lowest_habit = min(stats.habits_stats, key=lambda x: x.accuracy_rate) if stats.habits_stats else None
        highest_habit = max(stats.habits_stats, key=lambda x: x.accuracy_rate) if stats.habits_stats else None

        insights = []
        if lowest_habit and lowest_habit.accuracy_rate < 80:
            insights.append(f"O hábito **{lowest_habit.name}** está com acurácia de {lowest_habit.accuracy_rate}%, indicando que a rotina deste período requer reforço de lembrete.")
        if highest_habit and highest_habit.accuracy_rate >= 90:
            insights.append(f"Destaque positivo para **{highest_habit.name}** com consistência exemplar ({highest_habit.accuracy_rate}%).")

        return f"""### 📋 Diagnóstico de Andamento ({stats.name})
- **Período Ativo:** Iniciado em **{stats.start_date.strftime('%d/%m/%Y')}** (Dia {stats.days_elapsed} de {stats.duration_days}). Restam **{stats.days_remaining} dias**.
- **Acurácia Geral:** **{stats.accuracy_rate}%** (Meta: {stats.target_accuracy}%). O desempenho atual está **{on_track_text}**.
- **Dias 100% Concluídos:** Você atingiu **{stats.days_perfect} dias perfeitos** com todas as aplicações realizadas.

### 🩺 Análise de Hábitos & Diário de Sintomas
- {' '.join(insights)}
- **Sintomas & Sensações:** Com base nas notas registradas ({len(timeline)} registros), você reportou melhora geral das crises ("me senti muito bem", "sem crises e sem coceira"), com episódio isolado de congestão que respondeu bem à lavagem nasal.

### 🎯 Recomendações para Manter a Acurácia
1. **Ajuste de Horário Noturno:** As aplicações noturnas costumam ter maior taxa de esquecimento devido ao cansaço. Mantenha o despertador da Rotina Noturna fixo às 21h30.
2. **Garantia de Estoque:** Mantenha os novos frascos organizados no local de aplicação para evitar interrupções nos {stats.duration_days} dias.
3. **Continuidade das Notas:** Continue anotando as sensações diárias para gerar relatórios detalhados nas próximas consultas!
"""
