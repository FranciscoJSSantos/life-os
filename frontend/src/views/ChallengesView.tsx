import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  Sparkles, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  X,
  FileText,
  Award
} from 'lucide-react';
import { 
  api, 
  type ChallengeRead, 
  type ChallengeSummaryReport, 
  type HabitTodayItem,
  type ChallengeCreateDto
} from '../api/client';

interface ChallengesViewProps {
  habits: HabitTodayItem[];
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({ habits }) => {
  const [challenges, setChallenges] = useState<ChallengeRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeRead | null>(null);

  // Modal Resumo IA
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryReport, setSummaryReport] = useState<ChallengeSummaryReport | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('lifeos_ai_key') || '');
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Modal Novo Desafio
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDuration, setNewDuration] = useState(90);
  const [newTarget, setNewTarget] = useState(90);
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const data = await api.getChallenges();
      setChallenges(data);
      if (data.length > 0 && !selectedChallenge) {
        setSelectedChallenge(data[0]);
      }
    } catch (err) {
      console.error('Erro ao buscar desafios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleOpenSummary = async (challenge: ChallengeRead) => {
    setSelectedChallenge(challenge);
    setIsSummaryModalOpen(true);
    setLoadingSummary(true);
    try {
      const report = await api.getChallengeSummary(challenge.id, {
        api_key: apiKey.trim() || undefined,
        provider,
        custom_prompt: customPrompt.trim() || undefined
      });
      setSummaryReport(report);
    } catch (err) {
      console.error('Erro ao gerar relatório do desafio:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleRegenerateSummary = async () => {
    if (!selectedChallenge) return;
    if (apiKey.trim()) {
      localStorage.setItem('lifeos_ai_key', apiKey.trim());
    }
    setLoadingSummary(true);
    try {
      const report = await api.getChallengeSummary(selectedChallenge.id, {
        api_key: apiKey.trim() || undefined,
        provider,
        custom_prompt: customPrompt.trim() || undefined
      });
      setSummaryReport(report);
    } catch (err) {
      console.error('Erro ao regenerar relatório:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || selectedHabitIds.length === 0) return;
    setCreating(true);
    try {
      const payload: ChallengeCreateDto = {
        name: newName.trim(),
        description: newDesc.trim() || undefined,
        start_date: new Date().toISOString().split('T')[0],
        duration_days: Number(newDuration),
        target_accuracy: Number(newTarget),
        habit_ids: selectedHabitIds
      };
      await api.createChallenge(payload);
      setIsCreateModalOpen(false);
      setNewName('');
      setNewDesc('');
      fetchChallenges();
    } catch (err) {
      console.error('Erro ao criar desafio:', err);
    } finally {
      setCreating(false);
    }
  };

  const toggleHabitSelection = (habitId: string) => {
    if (selectedHabitIds.includes(habitId)) {
      setSelectedHabitIds(selectedHabitIds.filter(id => id !== habitId));
    } else {
      setSelectedHabitIds([...selectedHabitIds, habitId]);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Desafios & Acurácia
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Meça rigorosamente a sua taxa de acurácia, consistência de doses e evolução clínica com IA.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedHabitIds(habits.map(h => h.id));
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Desafio</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Carregando desafios...</div>
      ) : challenges.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#161D29]/60 border border-dashed border-white/10 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Nenhum desafio ativo</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Crie um desafio como o "Protocolo 90 Dias de Soro & Minoxidil" para acompanhar a sua taxa de acurácia diária.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md"
          >
            Criar meu primeiro desafio
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {challenges.map((challenge) => {
            const isTargetReached = challenge.is_on_track;
            const progressPercent = Math.min(100, Math.round((challenge.days_elapsed / challenge.duration_days) * 100));

            return (
              <div
                key={challenge.id}
                className="p-6 rounded-2xl bg-[#161D29] border border-white/10 shadow-xl space-y-6 relative overflow-hidden"
              >
                {/* Background glow sutil */}
                <div 
                  className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
                  style={{ backgroundColor: challenge.color || '#06B6D4' }}
                />

                {/* Challenge Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                        <Trophy className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-xl font-extrabold text-white tracking-tight">
                          {challenge.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {challenge.description || 'Acompanhamento rigoroso de adesão diária'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botão Resumo IA em destaque */}
                  <button
                    onClick={() => handleOpenSummary(challenge)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Gerar Resumo do Andamento (IA)</span>
                  </button>
                </div>

                {/* KPIs e Acurácia */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Card 1: Acurácia Real */}
                  <div className="p-4 rounded-xl bg-[#0F141C] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Acurácia Atual</span>
                      <Target className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-2xl font-black text-cyan-400 font-mono">
                      {challenge.accuracy_rate}%
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Meta mínima: {challenge.target_accuracy}%
                    </p>
                  </div>

                  {/* Card 2: Dias Decorridos */}
                  <div className="p-4 rounded-xl bg-[#0F141C] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Progresso</span>
                      <Calendar className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-2xl font-black text-white font-mono">
                      {challenge.days_elapsed} <span className="text-xs text-slate-500 font-normal">/ {challenge.duration_days} dias</span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Restam {challenge.days_remaining} dias para a meta
                    </p>
                  </div>

                  {/* Card 3: Dias 100% OK */}
                  <div className="p-4 rounded-xl bg-[#0F141C] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Dias 100% OK</span>
                      <Award className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-black text-emerald-400 font-mono">
                      {challenge.days_perfect} dias
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Todas as doses concluídas
                    </p>
                  </div>

                  {/* Card 4: Status do Alvo */}
                  <div className="p-4 rounded-xl bg-[#0F141C] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Status do Alvo</span>
                      {isTargetReached ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <p className={`text-base font-black ${isTargetReached ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isTargetReached ? 'Dentro da Meta' : 'Atenção Necessária'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Iniciado em {new Date(challenge.start_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Barra de Dias Percorridos */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Linha do Tempo do Desafio</span>
                    <span className="font-mono font-semibold text-slate-300">{progressPercent}% do tempo total</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Acurácia Individual por Hábito */}
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Desempenho Individual dos Hábitos Vinculados
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {challenge.habits_stats.map((hs) => (
                      <div
                        key={hs.habit_id}
                        className="p-3.5 rounded-xl bg-[#0F141C] border border-white/5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: hs.color || '#06B6D4' }}
                          />
                          <div className="min-w-0">
                            <h5 className="text-sm font-semibold text-slate-200 truncate">{hs.name}</h5>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {hs.completed_count} de {hs.expected_count} aplicações feitas
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-sm font-mono font-extrabold ${
                              hs.accuracy_rate >= 80 ? 'text-emerald-400' : hs.accuracy_rate >= 50 ? 'text-amber-400' : 'text-red-400'
                            }`}
                          >
                            {hs.accuracy_rate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Relatório do Andamento (IA) */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-[#161D29] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header Modal */}
            <div className="p-4 border-b border-white/10 bg-[#121824] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Relatório Inteligente de Andamento</h3>
                  <p className="text-[11px] text-slate-400">{selectedChallenge?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Relatório */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {loadingSummary ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">
                    Compilando histórico, sintomas e gerando análise do andamento...
                  </p>
                </div>
              ) : (
                <>
                  {/* Bloco de Configuração de Chave de IA */}
                  <div className="p-3.5 rounded-xl bg-[#0F141C] border border-white/10 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-cyan-400" />
                        Chave de API de IA (Gemini ou OpenAI)
                      </span>
                      <button
                        onClick={() => setShowKeyInput(!showKeyInput)}
                        className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                      >
                        {showKeyInput ? 'Ocultar' : apiKey ? 'Alterar Chave' : '+ Informar API Key'}
                      </button>
                    </div>

                    {showKeyInput && (
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex gap-2">
                          <select
                            value={provider}
                            onChange={(e: any) => setProvider(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#161D29] border border-white/10 text-white text-xs"
                          >
                            <option value="gemini">Google Gemini</option>
                            <option value="openai">OpenAI (ChatGPT)</option>
                          </select>
                          <input
                            type="password"
                            placeholder="Cole sua API Key aqui..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-[#161D29] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Instrução adicional (opcional, ex: focar na congestão nasal)"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#161D29] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          onClick={handleRegenerateSummary}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
                        >
                          Salvar e Regenerar Análise
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Texto Analítico Formatado */}
                  <div className="p-4 rounded-xl bg-[#0F141C] border border-cyan-500/20 text-slate-200 text-xs leading-relaxed space-y-3 font-sans whitespace-pre-wrap">
                    {summaryReport?.ai_analysis}
                  </div>

                  {/* Linha do Tempo de Sintomas Registrados */}
                  {summaryReport && summaryReport.timeline_notes.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        Histórico Completo de Notas & Sintomas
                      </h4>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {summaryReport.timeline_notes.map((tn, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-[#0F141C] border border-white/5 text-xs flex items-start gap-2"
                          >
                            <span className="font-mono text-[11px] text-cyan-400 font-bold shrink-0">
                              {new Date(tn.date + 'T12:00:00').toLocaleDateString('pt-BR')}:
                            </span>
                            <span className="text-slate-300">
                              <strong className="text-slate-200">{tn.habit_name}</strong> — {tn.note}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-white/10 bg-[#121824] flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                LifeOS Health & Habit Analytics
              </span>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Novo Desafio */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#161D29] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 bg-[#121824] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Criar Novo Desafio</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Desafio *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Desafio 300 Dias de Minoxidil..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Objetivo ou protocolo..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duração em Dias
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="365"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Meta de Acurácia (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              {/* Seletor de Hábitos Participantes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Selecione os Hábitos Participantes deste Desafio:
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {habits.map((h) => {
                    const isSelected = selectedHabitIds.includes(h.id);
                    return (
                      <div
                        key={h.id}
                        onClick={() => toggleHabitSelection(h.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                            : 'bg-[#0F141C] border-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="font-semibold">{h.name}</span>
                        <span className="font-mono text-[11px]">{isSelected ? '✓ Selecionado' : '+ Incluir'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || selectedHabitIds.length === 0}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Criando...' : 'Iniciar Desafio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
