import React, { useState } from 'react';
import { 
  Flame, 
  Check, 
  Plus, 
  CheckSquare, 
  Sparkles, 
  TrendingUp 
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

  const handleIncrementHabit = async (e: React.MouseEvent, habit: HabitTodayItem) => {
    e.stopPropagation();
    try {
      setUpdatingId(habit.id);
      const nextVal = (habit.current_value || 0) + (habit.habit_type === 'NUMERIC' ? 250 : 5);
      await api.toggleHabit(habit.id, undefined, nextVal);
      onReload();
    } catch (err) {
      console.error('Erro ao incrementar hábito:', err);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header com Saudação e Data */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            {dateCapitalized}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{greeting}!</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickAdd('habit')}
            className="px-3.5 py-2 rounded-xl bg-[#161D29] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
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

      {/* Card de Progresso Diário */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#161D29] to-[#121824] border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Progresso de Hoje</h3>
              <p className="text-xs text-slate-400">
                {completedTotal} de {totalItems} metas concluídas
              </p>
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {completionPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Grid de Seções: Hábitos e Tarefas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seção de Hábitos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Hábitos ({habits.filter(h => h.completed).length}/{habits.length})
              </h3>
            </div>
            <button
              onClick={() => onOpenQuickAdd('habit')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#161D29]/60 border border-dashed border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Nenhum hábito para hoje</p>
                <p className="text-xs text-slate-400 mt-0.5">Crie rotinas saudáveis e acompanhe seu progresso</p>
              </div>
              <button
                onClick={() => onOpenQuickAdd('habit')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer transition-colors"
              >
                Criar primeiro hábito
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {habits.map((habit) => {
                const isDone = habit.completed;
                const isBusy = updatingId === habit.id;

                return (
                  <div
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit)}
                    className={`group p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-[#161D29]/40 border-white/5 opacity-75'
                        : 'bg-[#161D29] hover:bg-[#1A2230] border-white/10 shadow-sm hover:border-indigo-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox Circular */}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleHabit(habit);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                            : 'border-2 border-slate-600 hover:border-indigo-400 text-transparent hover:text-slate-400'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-semibold truncate ${
                              isDone ? 'line-through text-slate-500' : 'text-slate-100'
                            }`}
                          >
                            {habit.name}
                          </h4>
                          {habit.streak > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                              <Flame className="w-3 h-3 fill-amber-400" />
                              {habit.streak}d
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: habit.color || '#6366F1' }}
                          />
                          <span className="truncate">{habit.category}</span>
                          {habit.habit_type !== 'BOOLEAN' && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-300">
                                {habit.current_value}/{habit.target_value} {habit.unit}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botão de Incremento Rápido se for Numérico ou Duração */}
                    {habit.habit_type !== 'BOOLEAN' && !isDone && (
                      <button
                        type="button"
                        onClick={(e) => handleIncrementHabit(e, habit)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                        title="Incrementar progresso"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+{habit.habit_type === 'NUMERIC' ? '250' : '5'}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Seção de Tarefas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Tarefas ({habits.filter(h => h.completed).length}/{tasks.length})
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

          {tasks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#161D29]/60 border border-dashed border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Nenhuma tarefa pendente</p>
                <p className="text-xs text-slate-400 mt-0.5">Adicione afazeres, prazos ou tarefas diárias</p>
              </div>
              <button
                onClick={() => onOpenQuickAdd('task')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer transition-colors"
              >
                Criar primeira tarefa
              </button>
            </div>
          ) : (
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
                      {/* Checkbox Quadrado */}
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

                      {/* Info */}
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
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{task.category}</span>
                          {task.subtasks_count > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-300">
                                {task.subtasks_completed}/{task.subtasks_count} subtarefas
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
