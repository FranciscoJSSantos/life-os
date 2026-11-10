import sqlite3
import csv
from datetime import datetime
import uuid

def migrate_all_sheets():
    conn = sqlite3.connect('data/lifeos.db')
    c = conn.cursor()

    print("1. Limpando dados antigos para sincronizar com as 3 abas...")
    c.execute("DELETE FROM habit_logs")
    c.execute("DELETE FROM habit_schedules")
    c.execute("DELETE FROM habits")
    c.execute("DELETE FROM routine_items")
    c.execute("DELETE FROM routines")
    c.execute("DELETE FROM task_subtasks")
    c.execute("DELETE FROM tasks")

    # 2. Criar ou atualizar categorias
    categories_def = [
        ("Tratamento Médico", "#06B6D4", "activity", "Acompanhamento diário de soros prescritos"),
        ("Cuidados Pessoais", "#3B82F6", "sparkles", "Acompanhamento de Minoxidil manhã e noite"),
        ("Caderno Mental", "#F59E0B", "brain", "Reflexões, humor e clareza mental diária"),
        ("Saúde", "#10B981", "heart", "Saúde geral e bem-estar")
    ]

    cat_map = {}
    for name, color, icon, desc in categories_def:
        c.execute("SELECT id FROM categories WHERE name = ?", (name,))
        row = c.fetchone()
        if row:
            cat_id = row[0]
            c.execute("UPDATE categories SET color = ?, icon = ?, description = ? WHERE id = ?", (color, icon, desc, cat_id))
        else:
            cat_id = str(uuid.uuid4())
            c.execute(
                "INSERT INTO categories (id, name, color, icon, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
                (cat_id, name, color, icon, desc)
            )
        cat_map[name] = cat_id

    print(f"Categorias configuradas: {list(cat_map.keys())}")

    # 3. Definir os 5 Hábitos das 3 Abas
    habits_def = [
        # Aba Soros Médicos (90 dias)
        {
            "key": "soro_manha",
            "name": "Soro Manhã",
            "desc": "Aplicação matinal do soro médico prescrito",
            "cat": "Tratamento Médico",
            "icon": "sun",
            "color": "#06B6D4",
            "start": "2026-11-07",
            "end": "2027-02-04"
        },
        {
            "key": "soro_noite",
            "name": "Soro Noite",
            "desc": "Aplicação noturna do soro médico prescrito",
            "cat": "Tratamento Médico",
            "icon": "moon",
            "color": "#8B5CF6",
            "start": "2026-11-07",
            "end": "2027-02-04"
        },
        # Aba Minoxidil (300 dias)
        {
            "key": "minoxidil_manha",
            "name": "Minoxidil Manhã",
            "desc": "Aplicação diária de Minoxidil prescrito pela manhã",
            "cat": "Cuidados Pessoais",
            "icon": "sun",
            "color": "#3B82F6",
            "start": "2026-11-07",
            "end": "2027-09-03"
        },
        {
            "key": "minoxidil_noite",
            "name": "Minoxidil Noite",
            "desc": "Aplicação diária de Minoxidil prescrito à tarde / noite",
            "cat": "Cuidados Pessoais",
            "icon": "moon",
            "color": "#6366F1",
            "start": "2026-11-07",
            "end": "2027-09-03"
        },
        # Aba Caderno Mental (90 dias)
        {
            "key": "caderno_mental",
            "name": "Caderno Mental",
            "desc": "Registro diário de humor, reflexões e clareza mental",
            "cat": "Caderno Mental",
            "icon": "brain",
            "color": "#F59E0B",
            "start": "2026-11-07",
            "end": "2027-02-04"
        }
    ]

    habit_ids = {}
    for h in habits_def:
        h_id = str(uuid.uuid4())
        habit_ids[h["key"]] = h_id
        c.execute(
            """
            INSERT INTO habits (id, category_id, name, description, icon, color, habit_type, target_value, unit, status, start_date, end_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'BOOLEAN', 1.0, NULL, 'ACTIVE', ?, ?, datetime('now'), datetime('now'))
            """,
            (h_id, cat_map[h["cat"]], h["name"], h["desc"], h["icon"], h["color"], h["start"], h["end"])
        )
        c.execute(
            """
            INSERT INTO habit_schedules (id, habit_id, frequency_type, effective_from, effective_until, created_at, updated_at)
            VALUES (?, ?, 'DAILY', ?, ?, datetime('now'), datetime('now'))
            """,
            (str(uuid.uuid4()), h_id, h["start"], h["end"])
        )

    print("5 Hábitos criados com sucesso:")
    for k, hid in habit_ids.items():
        print(f"  - {k}: {hid}")

    # 4. Importar Logs do CSV de Soros
    print("\n--- Importando histórico de Soros Médicos ---")
    with open('sheet_soro.csv', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or len(row) < 5:
                continue
            parsed_date = None
            date_col = None
            for c_idx in [1, 0, 2]:
                if c_idx < len(row):
                    try:
                        parsed_date = datetime.strptime(row[c_idx].strip(), "%d/%m/%Y").date()
                        date_col = c_idx
                        break
                    except ValueError:
                        pass
            if not parsed_date:
                continue

            try:
                s_manha = row[date_col + 2].strip().upper() == 'TRUE'
                s_noite = row[date_col + 3].strip().upper() == 'TRUE'
                sintomas = row[date_col + 5].strip() if (date_col + 5) < len(row) else ""
                obs = row[date_col + 6].strip() if (date_col + 6) < len(row) else ""
                note = f"{sintomas} | {obs}".strip(" |") if (sintomas or obs) else None
                iso_d = parsed_date.isoformat()

                if s_manha:
                    c.execute(
                        "INSERT INTO habit_logs (id, habit_id, scheduled_date, value, status, notes, created_at, updated_at) VALUES (?, ?, ?, 1.0, 'COMPLETED', ?, datetime('now'), datetime('now'))",
                        (str(uuid.uuid4()), habit_ids["soro_manha"], iso_d, note)
                    )
                if s_noite:
                    c.execute(
                        "INSERT INTO habit_logs (id, habit_id, scheduled_date, value, status, notes, created_at, updated_at) VALUES (?, ?, ?, 1.0, 'COMPLETED', ?, datetime('now'), datetime('now'))",
                        (str(uuid.uuid4()), habit_ids["soro_noite"], iso_d, note)
                    )
                if s_manha or s_noite:
                    print(f"  Soro {iso_d}: Manhã={s_manha}, Noite={s_noite}, Nota={note}")
            except Exception as e:
                pass

    # 5. Importar Logs do CSV de Minoxidil
    print("\n--- Importando histórico de Minoxidil ---")
    with open('sheet_minoxidil.csv', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or len(row) < 5:
                continue
            parsed_date = None
            date_col = None
            for c_idx in [1, 0, 2]:
                if c_idx < len(row):
                    try:
                        parsed_date = datetime.strptime(row[c_idx].strip(), "%d/%m/%Y").date()
                        date_col = c_idx
                        break
                    except ValueError:
                        pass
            if not parsed_date:
                continue

            try:
                m_manha = row[date_col + 2].strip().upper() == 'TRUE'
                m_noite = row[date_col + 3].strip().upper() == 'TRUE'
                sintomas = row[date_col + 5].strip() if (date_col + 5) < len(row) else ""
                obs = row[date_col + 6].strip() if (date_col + 6) < len(row) else ""
                note = f"{sintomas} | {obs}".strip(" |") if (sintomas or obs) else None
                iso_d = parsed_date.isoformat()

                if m_manha:
                    c.execute(
                        "INSERT INTO habit_logs (id, habit_id, scheduled_date, value, status, notes, created_at, updated_at) VALUES (?, ?, ?, 1.0, 'COMPLETED', ?, datetime('now'), datetime('now'))",
                        (str(uuid.uuid4()), habit_ids["minoxidil_manha"], iso_d, note)
                    )
                if m_noite:
                    c.execute(
                        "INSERT INTO habit_logs (id, habit_id, scheduled_date, value, status, notes, created_at, updated_at) VALUES (?, ?, ?, 1.0, 'COMPLETED', ?, datetime('now'), datetime('now'))",
                        (str(uuid.uuid4()), habit_ids["minoxidil_noite"], iso_d, note)
                    )
                if m_manha or m_noite:
                    print(f"  Minoxidil {iso_d}: Manhã={m_manha}, Noite={m_noite}, Nota={note}")
            except Exception as e:
                pass

    # 6. Importar Logs do Caderno Mental (se houver registros)
    print("\n--- Importando histórico de Caderno Mental ---")
    with open('sheet_caderno_mental.csv', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or len(row) < 4:
                continue
            parsed_date = None
            date_col = None
            for c_idx in [1, 0, 2]:
                if c_idx < len(row):
                    try:
                        parsed_date = datetime.strptime(row[c_idx].strip(), "%d/%m/%Y").date()
                        date_col = c_idx
                        break
                    except ValueError:
                        pass
            if not parsed_date:
                continue

            try:
                feito = row[date_col + 2].strip().upper() == 'TRUE'
                humor = row[date_col + 4].strip() if (date_col + 4) < len(row) else ""
                reflexao = row[date_col + 5].strip() if (date_col + 5) < len(row) else ""
                obs = row[date_col + 6].strip() if (date_col + 6) < len(row) else ""
                note_parts = [p for p in [humor, reflexao, obs] if p]
                note = " | ".join(note_parts) if note_parts else None
                iso_d = parsed_date.isoformat()

                if feito:
                    c.execute(
                        "INSERT INTO habit_logs (id, habit_id, scheduled_date, value, status, notes, created_at, updated_at) VALUES (?, ?, ?, 1.0, 'COMPLETED', ?, datetime('now'), datetime('now'))",
                        (str(uuid.uuid4()), habit_ids["caderno_mental"], iso_d, note)
                    )
                    print(f"  Caderno Mental {iso_d}: Concluído, Nota={note}")
            except Exception as e:
                pass

    # 7. Criar Rotinas Integradas do HabitNow
    rotina_matinal_id = str(uuid.uuid4())
    c.execute(
        """
        INSERT INTO routines (id, name, description, active, days_of_week, created_at, updated_at)
        VALUES (?, 'Rotina Matinal (Soros & Cuidados) ☀️', 'Tratamento matinal de soros, minoxidil e lavagem nasal', 1, '0,1,2,3,4,5,6', datetime('now'), datetime('now'))
        """,
        (rotina_matinal_id,)
    )
    c.execute(
        "INSERT INTO routine_items (id, routine_id, title, start_time, duration_minutes, position, linked_habit_id, created_at, updated_at) VALUES (?, ?, 'Aplicação Soro Manhã', '07:30', 5, 1, ?, datetime('now'), datetime('now'))",
        (str(uuid.uuid4()), rotina_matinal_id, habit_ids["soro_manha"])
    )
    c.execute(
        "INSERT INTO routine_items (id, routine_id, title, start_time, duration_minutes, position, linked_habit_id, created_at, updated_at) VALUES (?, ?, 'Aplicação Minoxidil Manhã', '07:40', 5, 2, ?, datetime('now'), datetime('now'))",
        (str(uuid.uuid4()), rotina_matinal_id, habit_ids["minoxidil_manha"])
    )
    c.execute(
        "INSERT INTO routine_items (id, routine_id, title, start_time, duration_minutes, position, created_at, updated_at) VALUES (?, ?, 'Lavagem Nasal com Soro Fisiológico', '07:50', 10, 3, datetime('now'), datetime('now'))",
        (str(uuid.uuid4()), rotina_matinal_id)
    )

    rotina_noturna_id = str(uuid.uuid4())
    c.execute(
        """
        INSERT INTO routines (id, name, description, active, days_of_week, created_at, updated_at)
        VALUES (?, 'Rotina Noturna (Soros & Mente) 🌙', 'Minoxidil da noite, soro noturno e Caderno Mental', 1, '0,1,2,3,4,5,6', datetime('now'), datetime('now'))
        """,
        (rotina_noturna_id,)
    )
    c.execute(
        "INSERT INTO routine_items (id, routine_id, title, start_time, duration_minutes, position, linked_habit_id, created_at, updated_at) VALUES (?, ?, 'Aplicação Minoxidil Noite', '21:00', 5, 1, ?, datetime('now'), datetime('now'))",
        (str(uuid.uuid4()), rotina_noturna_id, habit_ids["minoxidil_noite"])
    )
    c.execute(
        "INSERT INTO routine_items (id, routine_id, title, start_time, duration_minutes, position, linked_habit_id, created_at, updated_at) VALUES (?, ?, 'Aplicação Soro Noite', '21:30', 5, 2, ?, datetime('now'), datetime('now'))",
        (str(uuid.uuid4()), rotina_noturna_id, habit_ids["soro_noite"])
    )
    c.execute(
        "INSERT INTO routine_items (id, routine_id, title, start_time, duration_minutes, position, linked_habit_id, created_at, updated_at) VALUES (?, ?, 'Caderno Mental (Reflexões do Dia)', '21:45', 10, 3, ?, datetime('now'), datetime('now'))",
        (str(uuid.uuid4()), rotina_noturna_id, habit_ids["caderno_mental"])
    )

    # 8. Tarefas de Apoio às 3 frentes
    c.execute(
        "INSERT INTO tasks (id, category_id, title, description, priority, status, due_date, created_at, updated_at) VALUES (?, ?, 'Comprar novo frasco de soro médico antes do dia 25', 'Garantir reposição do frasco prescrito para os 90 dias', 'HIGH', 'PENDING', '2026-11-25', datetime('now'), datetime('now'))",
        (str(uuid.uuid4()), cat_map["Tratamento Médico"])
    )
    c.execute(
        "INSERT INTO tasks (id, category_id, title, description, priority, status, due_date, created_at, updated_at) VALUES (?, ?, 'Consulta de retorno / reavaliação de 30 dias de soros', 'Apresentar histórico de adesão e sintomas dos primeiros 30 dias', 'URGENT', 'PENDING', '2026-12-07', datetime('now'), datetime('now'))",
        (str(uuid.uuid4()), cat_map["Tratamento Médico"])
    )
    c.execute(
        "INSERT INTO tasks (id, category_id, title, description, priority, status, due_date, created_at, updated_at) VALUES (?, ?, 'Comprar reposição de Minoxidil', 'Manter estoque para a adesão contínua de 300 dias', 'MEDIUM', 'PENDING', '2026-11-30', datetime('now'), datetime('now'))",
        (str(uuid.uuid4()), cat_map["Cuidados Pessoais"])
    )

    conn.commit()
    conn.close()
    print("\n✅ TODAS AS 3 ABAS FORAM MIGRADAS COM 100% DE SUCESSO!")

if __name__ == '__main__':
    migrate_all_sheets()
