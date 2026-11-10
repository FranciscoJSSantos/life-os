import React, { useState } from 'react';
import { 
  Flame, 
  Check, 
  Plus, 
  CheckSquare, 
  Sparkles, 
  TrendingUp,
  MessageSquare,
  Sun,
  Moon,
  Activity,
  Brain,
  Droplets,
  X,
  Circle,
  CheckCircle2
} from 'lucide-react';
import { api, type HabitTodayItem, type TaskTodayItem } from '../api/client';

interface DashboardViewProps {
  habits: HabitTodayItem[];
  tasks: TaskTodayItem[];
  onReload: () => void;
  onOpenQuickAdd: (type: 'habit' | 'task') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  habits,
  tasks,
  onReload,
  onOpenQuickAdd
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Modal de notas com suporte a período
  const [editingNotesHabit, setEditingNotesHabit] = useState<HabitTodayItem | null>(null);
  const [editingPeriod, setEditingPeriod] = useState<string | undefined>(undefined);
  const [notesInput, setNotesInput] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('TODOS');

  // Cálculo de progresso diário ponderado
  const totalItems = habits.length + tasks.length;
  const completedHabitsWeight = habits.reduce((acc, h) => {
    if (h.target_value > 0) {
      return acc + Math.min(1.0, h.current_value / h.target_value);
    }
    return acc + (h.completed ? 1.0 : 0.0);
  }, 0);
  const completedTasks = tasks.filter(t => t.completed).length;
  const completedTotal = Math.round(completedHabitsWeight + completedTasks);
  const completionPercentage = totalItems > 0 
    ? Math.min(100, Math.round(((completedHabitsWeight + completedTasks) / totalItems) * 100)) 
    : 0;

  // Formatação de data em português
  const todayDate = new Date();
  const dateFormatted = todayDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const dateCapitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  // Saudação de acordo com o horário
  const hour = todayDate.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const handleToggleHabit = async (habit: HabitTodayItem, period?: string) => {
    try {
      setUpdatingId(`${habit.id}-${period || 'all'}`);
      await api.toggleHabit(habit.id, undefined, undefined, undefined, period);
      onReload();
    } catch (err) {
      console.error('Erro ao alternar hábito:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenNotes = (e: React.MouseEvent, habit: HabitTodayItem, period?: string) => {
    e.stopPropagation();
    setEditingNotesHabit(habit);
    setEditingPeriod(period);
    
    // Obter notas existentes do período ou do hábito
    if (period && habit.period_statuses) {
      const ps = habit.period_statuses.find(p => p.period === period);
      setNotesInput(ps?.notes || '');
    } else {
      setNotesInput(habit.notes || '');
    }
  };

  const handleSaveNotes = async () => {
    if (!editingNotesHabit) return;
    try {
      setUpdatingId(`${editingNotesHabit.id}-${editingPeriod || 'all'}`);
      await api.toggleHabit(editingNotesHabit.id, undefined, undefined, notesInput.trim(), editingPeriod);
      setEditingNotesHabit(null);
      setEditingPeriod(undefined);
      onReload();
    } catch (err) {
      console.error('Erro ao salvar observações/sintomas:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleTask = async (task: TaskTodayItem) => {
    try {
      setUpdatingId(task.id);
      await api.toggleTask(task.id);
      onReload();
    } catch (err) {
      console.error('Erro ao alternar tarefa:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityBadge = (priority: TaskTodayItem['priority']) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">Urgente</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Alta</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Média</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-500/20 text-slate-400">Baixa</span>;
    }
  };

  // Identificação dos 3 protocolos principais
  const soroHabit = habits.find(h => h.name.toLowerCase().includes('soro'));
  const minoxHabit = habits.find(h => h.name.toLowerCase().includes('minoxidil'));
  const mentalHabit = habits.find(h => h.name.toLowerCase().includes('caderno'));

  const filteredHabits = habits.filter(h => {
    if (activeCategoryFilter === 'TODOS') return true;
    if (activeCategoryFilter === 'SOROS') return h.name.toLowerCase().includes('soro');
    if (activeCategoryFilter === 'MINOXIDIL') return h.name.toLowerCase().includes('minoxidil');
    if (activeCategoryFilter === 'MENTAL') return h.name.toLowerCase().includes('caderno');
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header com Saudação e Data */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{dateCapitalized}</span>
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{greeting}!</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Seus protocolos diários com suporte a múltiplos turnos e acompanhamento de sintomas.
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAdd('habit')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Hábito</span>
        </button>
      </div>

      {/* 3 Cartões de Acesso aos Protocolos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Soros Médicos */}
        <div
          onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'SOROS' ? 'TODOS' : 'SOROS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeCategoryFilter === 'SOROS'
              ? 'bg-[#15232d] border-cyan-500 shadow-md ring-2 ring-cyan-500/30'
              : 'bg-[#161D29] border-white/10 hover:border-cyan-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Manhã & Noite
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">Soros Médicos</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Protocolo 90 Dias</p>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Hoje:</span>
            <span className={`font-mono font-bold ${
              soroHabit?.completed ? 'text-emerald-400' : soroHabit?.is_partial ? 'text-amber-400' : 'text-slate-400'
            }`}>
              {soroHabit ? `${soroHabit.current_value}/${soroHabit.target_value} doses` : '0/2'}
            </span>
          </div>
        </div>

        {/* Card 2: Minoxidil */}
        <div
          onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'MINOXIDIL' ? 'TODOS' : 'MINOXIDIL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeCategoryFilter === 'MINOXIDIL'
              ? 'bg-[#181d33] border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
              : 'bg-[#161D29] border-white/10 hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Droplets className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Manhã & Noite
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">Minoxidil</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Protocolo 90 Dias</p>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Hoje:</span>
            <span className={`font-mono font-bold ${
              minoxHabit?.completed ? 'text-emerald-400' : minoxHabit?.is_partial ? 'text-amber-400' : 'text-slate-400'
            }`}>
              {minoxHabit ? `${minoxHabit.current_value}/${minoxHabit.target_value} doses` : '0/2'}
            </span>
          </div>
        </div>

        {/* Card 3: Caderno Mental */}
        <div
          onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'MENTAL' ? 'TODOS' : 'MENTAL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeCategoryFilter === 'MENTAL'
              ? 'bg-[#211a14] border-amber-500 shadow-md ring-2 ring-amber-500/30'
              : 'bg-[#161D29] border-white/10 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Brain className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Diário
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">Caderno Mental</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Reflexões & Humor</p>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Hoje:</span>
            <span className="font-mono font-bold text-amber-400">
              {mentalHabit?.completed ? '1/1 feito' : '0/1 pendente'}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Progresso Geral Ponderada */}
      <div className="p-4 rounded-2xl bg-[#161D29] border border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white">Adesão Geral do Dia</span>
            <p className="text-[11px] text-slate-400">
              {completedTotal} de {totalItems} metas cumpridas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 hidden sm:block h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completionPercentage >= 80 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                  : completionPercentage >= 40 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className={`text-lg font-black font-mono ${
            completionPercentage >= 80 ? 'text-emerald-400' : completionPercentage >= 40 ? 'text-amber-400' : 'text-slate-400'
          }`}>
            {completionPercentage}%
          </span>
        </div>
      </div>

      {/* Grid de Hábitos e Tarefas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seção de Hábitos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Hábitos & Protocolos
              </h3>
            </div>
            {activeCategoryFilter !== 'TODOS' && (
              <button
                onClick={() => setActiveCategoryFilter('TODOS')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
              >
                Limpar Filtro ({activeCategoryFilter})
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredHabits.map((habit) => {
              const isMultiPeriod = Boolean(habit.periods && habit.periods.length > 0);
              const isDone = habit.completed;
              const isPartial = Boolean(habit.is_partial);
              const isMental = habit.name.toLowerCase().includes('caderno');
              const isMinox = habit.name.toLowerCase().includes('minoxidil');

              return (
                <div
                  key={habit.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                    isDone
                      ? 'bg-[#161D29]/70 border-emerald-500/20'
                      : isPartial
                      ? 'bg-[#1a1b24] border-amber-500/30 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-[#161D29] border-white/10 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Ícone do Hábito */}
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 shadow-sm"
                        style={{ backgroundColor: habit.color || '#06B6D4' }}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                            {isMental ? (
                              <Brain className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : isMinox ? (
                              <Droplets className="w-4 h-4 text-indigo-400 shrink-0" />
                            ) : (
                              <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                            )}
                            <span>{habit.name}</span>
                          </h4>

                          {/* Badge de Status: Concluído (Verde) / Parcial (Amarelo) */}
                          {isDone ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                              100% OK
                            </span>
                          ) : isPartial ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 animate-pulse">
                              {Math.round(habit.completion_rate || 50)}% Parcial
                            </span>
                          ) : null}

                          {habit.streak > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                              <Flame className="w-3 h-3 fill-amber-400" />
                              {habit.streak}d
                            </span>
                          )}
                        </div>

                        {habit.description && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {habit.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Botão de Anotação Geral (quando não for por período ou para notas gerais) */}
                    {!isMultiPeriod && (
                      <button
                        type="button"
                        onClick={(e) => handleOpenNotes(e, habit)}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                          habit.notes
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                        }`}
                        title="Registrar reflexão ou sintomas"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {habit.notes ? 'Ver Nota' : '+ Reflexão'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* CASO 1: Hábito com Múltiplos Eventos no Dia (ex: Manhã & Noite) */}
                  {isMultiPeriod && habit.period_statuses && (
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {habit.period_statuses.map((ps) => {
                          const isPeriodMorning = ps.period.toLowerCase().includes('manhã');
                          const isBusy = updatingId === `${habit.id}-${ps.period}`;

                          return (
                            <div
                              key={ps.period}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                                ps.completed
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                                  : 'bg-[#0F141C] border-white/10 hover:border-white/20 text-slate-300'
                              }`}
                            >
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleToggleHabit(habit, ps.period)}
                                className="flex items-center gap-2 text-left min-w-0 cursor-pointer group/p"
                              >
                                {ps.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 group-hover/p:scale-110 transition-transform" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-500 group-hover/p:text-cyan-400 shrink-0 group-hover/p:scale-110 transition-all" />
                                )}
                                <div className="min-w-0">
                                  <span className="text-xs font-bold truncate flex items-center gap-1">
                                    {isPeriodMorning ? (
                                      <Sun className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                    ) : (
                                      <Moon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                    )}
                                    <span>{ps.period}</span>
                                  </span>
                                </div>
                              </button>

                              {/* Botão de Observação por Turno */}
                              <button
                                type="button"
                                onClick={(e) => handleOpenNotes(e, habit, ps.period)}
                                className={`p-1 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors shrink-0 ${
                                  ps.notes
                                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                                title={ps.notes ? `Sintomas (${ps.period})` : `Adicionar sintomas (${ps.period})`}
                              >
                                <MessageSquare className="w-3 h-3" />
                                {ps.notes && <span className="text-[10px]">Obs</span>}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Exibir notas de sintomas se existirem em algum período */}
                      {habit.period_statuses.some(ps => ps.notes) && (
                        <div className="space-y-1 pt-1">
                          {habit.period_statuses.filter(ps => ps.notes).map(ps => (
                            <div
                              key={ps.period}
                              onClick={(e) => handleOpenNotes(e, habit, ps.period)}
                              className="px-2.5 py-1.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-start gap-1.5 cursor-pointer hover:border-cyan-500/40"
                            >
                              <span className="font-semibold text-cyan-400 shrink-0">
                                {ps.period}:
                              </span>
                              <span className="italic break-words">{ps.notes}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CASO 2: Hábito de evento único (Check Simples) */}
                  {!isMultiPeriod && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-xs text-slate-400">
                        Status: <strong className={isDone ? 'text-emerald-400' : 'text-slate-300'}>{isDone ? 'Concluído' : 'Pendente'}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleHabit(habit)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                          isDone
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isDone ? 'Concluído' : 'Marcar Feito'}</span>
                      </button>
                    </div>
                  )}

                  {/* Exibição de Notas para Hábito Simples */}
                  {!isMultiPeriod && habit.notes && (
                    <div className="px-3 py-2 rounded-xl bg-[#0F141C] border border-cyan-500/20 text-xs text-cyan-200/90 flex items-start gap-2">
                      <span className="font-semibold text-cyan-400 shrink-0">
                        {isMental ? 'Reflexão/Humor:' : 'Sintomas:'}
                      </span>
                      <span className="italic">{habit.notes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Seção de Tarefas de Apoio */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Avisos & Prazos ({completedTasks}/{tasks.length})
              </h3>
            </div>
            <button
              onClick={() => onOpenQuickAdd('task')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => {
              const isDone = task.completed;
              const isBusy = updatingId === task.id;

              return (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task)}
                  className={`group p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-[#161D29]/40 border-white/5 opacity-75'
                      : 'bg-[#161D29] hover:bg-[#1A2230] border-white/10 shadow-sm hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTask(task);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isDone
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/30'
                          : 'border-2 border-slate-600 hover:border-indigo-400 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-semibold truncate ${
                            isDone ? 'line-through text-slate-500' : 'text-slate-100'
                          }`}
                        >
                          {task.title}
                        </h4>
                        {getPriorityBadge(task.priority)}
                      </div>
                      {task.due_date && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Prazo: <span className="text-slate-300 font-mono">{task.due_date}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal para Adicionar / Editar Sintomas ou Reflexão */}
      {editingNotesHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#161D29] border border-cyan-500/30 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {editingNotesHabit.name.includes('Caderno') ? 'Reflexão & Humor' : 'Sintomas / Como se Sentiu'}
                  </h4>
                  {editingPeriod && (
                    <span className="text-[11px] text-cyan-400 font-medium">
                      Turno: {editingPeriod}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingNotesHabit(null);
                  setEditingPeriod(undefined);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {editingNotesHabit.name.includes('Caderno')
                  ? 'Como está seu humor, reflexões e foco hoje:'
                  : `Observações ou sintomas após a dose (${editingPeriod || 'do dia'}):`}
              </label>
              <textarea
                rows={3}
                placeholder={
                  editingNotesHabit.name.includes('Caderno')
                    ? 'Ex: Dia produtivo, mente focada, sem ansiedade...'
                    : 'Ex: Me senti bem, sem crises, leve dor de cabeça 30min após a aplicação...'
                }
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0F141C] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingNotesHabit(null);
                  setEditingPeriod(undefined);
                }}
                className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Salvar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
