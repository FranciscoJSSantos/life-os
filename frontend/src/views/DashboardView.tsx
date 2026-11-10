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
  X
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
  const [editingNotesHabit, setEditingNotesHabit] = useState<HabitTodayItem | null>(null);
  const [notesInput, setNotesInput] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('TODOS');

  // Cálculo de progresso diário
  const totalItems = habits.length + tasks.length;
  const completedHabits = habits.filter(h => h.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completedTotal = completedHabits + completedTasks;
  const completionPercentage = totalItems > 0 ? Math.round((completedTotal / totalItems) * 100) : 0;

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

  const handleToggleHabit = async (habit: HabitTodayItem) => {
    try {
      setUpdatingId(habit.id);
      await api.toggleHabit(habit.id);
      onReload();
    } catch (err) {
      console.error('Erro ao alternar hábito:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenNotes = (e: React.MouseEvent, habit: HabitTodayItem) => {
    e.stopPropagation();
    setEditingNotesHabit(habit);
    setNotesInput(habit.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!editingNotesHabit) return;
    try {
      setUpdatingId(editingNotesHabit.id);
      await api.toggleHabit(editingNotesHabit.id, undefined, undefined, notesInput.trim());
      setEditingNotesHabit(null);
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

  // Contadores das 3 abas
  const soroDone = habits.filter(h => h.name.includes('Soro') && h.completed).length;
  const soroTotal = habits.filter(h => h.name.includes('Soro')).length;
  const minoxDone = habits.filter(h => h.name.includes('Minoxidil') && h.completed).length;
  const minoxTotal = habits.filter(h => h.name.includes('Minoxidil')).length;
  const mentalDone = habits.filter(h => h.name.includes('Caderno') && h.completed).length;
  const mentalTotal = habits.filter(h => h.name.includes('Caderno')).length;

  const filteredHabits = habits.filter(h => {
    if (activeCategoryFilter === 'TODOS') return true;
    if (activeCategoryFilter === 'SOROS') return h.name.includes('Soro');
    if (activeCategoryFilter === 'MINOXIDIL') return h.name.includes('Minoxidil');
    if (activeCategoryFilter === 'MENTAL') return h.name.includes('Caderno');
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
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickAdd('habit')}
            className="px-3.5 py-2 rounded-xl bg-[#161D29] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Novo Hábito</span>
          </button>
          <button
            onClick={() => onOpenQuickAdd('task')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Painel das 3 Frentes da Planilha (Soros, Minoxidil, Caderno Mental) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Soros Médicos */}
        <div 
          onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'SOROS' ? 'TODOS' : 'SOROS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeCategoryFilter === 'SOROS'
              ? 'bg-[#121c29] border-cyan-500 shadow-md ring-2 ring-cyan-500/30'
              : 'bg-[#161D29] border-white/10 hover:border-cyan-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              90 Dias
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">Soros Médicos</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Manhã & Noite</p>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Hoje:</span>
            <span className="font-mono font-bold text-cyan-400">{soroDone}/{soroTotal} feito</span>
          </div>
        </div>

        {/* Card 2: Minoxidil */}
        <div 
          onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'MINOXIDIL' ? 'TODOS' : 'MINOXIDIL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeCategoryFilter === 'MINOXIDIL'
              ? 'bg-[#161c2b] border-blue-500 shadow-md ring-2 ring-blue-500/30'
              : 'bg-[#161D29] border-white/10 hover:border-blue-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Droplets className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              300 Dias
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">Minoxidil</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Manhã & Tarde/Noite</p>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Hoje:</span>
            <span className="font-mono font-bold text-blue-400">{minoxDone}/{minoxTotal} feito</span>
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
              90 Dias
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">Caderno Mental</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Reflexões & Humor</p>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Hoje:</span>
            <span className="font-mono font-bold text-amber-400">{mentalDone}/{mentalTotal} feito</span>
          </div>
        </div>
      </div>

      {/* Barra de Progresso Geral */}
      <div className="p-4 rounded-2xl bg-[#161D29] border border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white">Adesão Total do Dia</span>
            <p className="text-[11px] text-slate-400">
              {completedTotal} de {totalItems} itens concluídos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 hidden sm:block h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-lg font-black text-emerald-400 font-mono">
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
                Hábitos ({completedHabits}/{habits.length})
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
              const isDone = habit.completed;
              const isBusy = updatingId === habit.id;
              const isMorning = habit.name.toLowerCase().includes('manhã');
              const isMental = habit.name.toLowerCase().includes('caderno');
              const isMinox = habit.name.toLowerCase().includes('minoxidil');

              return (
                <div
                  key={habit.id}
                  onClick={() => handleToggleHabit(habit)}
                  className={`group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                    isDone
                      ? 'bg-[#161D29]/60 border-white/5'
                      : 'bg-[#161D29] hover:bg-[#1A2230] border-white/10 shadow-sm hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox Circular */}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleHabit(habit);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                            : 'border-2 border-slate-600 hover:border-cyan-400 text-transparent hover:text-slate-400'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-bold truncate flex items-center gap-1.5 ${
                              isDone ? 'line-through text-slate-500' : 'text-slate-100'
                            }`}
                          >
                            {isMental ? (
                              <Brain className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : isMinox ? (
                              <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
                            ) : isMorning ? (
                              <Sun className="w-4 h-4 text-cyan-400 shrink-0" />
                            ) : (
                              <Moon className="w-4 h-4 text-purple-400 shrink-0" />
                            )}
                            <span>{habit.name}</span>
                          </h4>
                          {habit.streak > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                              <Flame className="w-3 h-3 fill-amber-400" />
                              {habit.streak}d
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {habit.description}
                        </p>
                      </div>
                    </div>

                    {/* Botão de Anotação de Sintomas / Reflexão */}
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
                        {habit.notes ? 'Ver Nota' : isMental ? '+ Reflexão' : '+ Sintomas'}
                      </span>
                    </button>
                  </div>

                  {/* Exibição de Sintomas / Reflexão */}
                  {habit.notes && (
                    <div className="mt-1 px-3 py-2 rounded-xl bg-[#0F141C] border border-cyan-500/20 text-xs text-cyan-200/90 flex items-start gap-2">
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
          <div className="w-full max-w-md bg-[#161D29] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-sm text-white">
                  {editingNotesHabit.name.includes('Caderno') ? 'Reflexão & Humor' : 'Sintomas / Como se Sentiu'}
                </h4>
              </div>
              <button
                onClick={() => setEditingNotesHabit(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {editingNotesHabit.name.includes('Caderno')
                  ? 'Como está seu humor, reflexões e foco hoje:'
                  : 'Observações, sintomas ou sensações de hoje:'}
              </label>
              <textarea
                rows={3}
                placeholder={
                  editingNotesHabit.name.includes('Caderno')
                    ? 'Ex: Dia produtivo, mente focada, sem ansiedade...'
                    : 'Ex: Me senti bem, sem crises, nariz desentupido...'
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
                onClick={() => setEditingNotesHabit(null)}
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
