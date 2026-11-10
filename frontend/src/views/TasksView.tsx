import React, { useState } from 'react';
import { CheckSquare, Plus, Calendar, Check } from 'lucide-react';
import type { TaskTodayItem } from '../api/client';

interface TasksViewProps {
  tasks: TaskTodayItem[];
  onOpenQuickAdd: (type: 'task') => void;
  onToggleTask: (task: TaskTodayItem) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onOpenQuickAdd,
  onToggleTask
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'PENDING') return !t.completed;
    if (filter === 'COMPLETED') return t.completed;
    return true;
  });

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-400" />
            <span>Gerenciar Tarefas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize pendências, compromissos e checklists do dia a dia.
          </p>
        </div>
        <button
          onClick={() => onOpenQuickAdd('task')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {(['ALL', 'PENDING', 'COMPLETED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            {f === 'ALL' && `Todas (${tasks.length})`}
            {f === 'PENDING' && `Pendentes (${tasks.filter(t => !t.completed).length})`}
            {f === 'COMPLETED' && `Concluídas (${tasks.filter(t => t.completed).length})`}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#161D29]/60 border border-dashed border-white/10 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <CheckSquare className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Nenhuma tarefa encontrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filter === 'COMPLETED'
              ? 'Você ainda não concluiu nenhuma tarefa hoje.'
              : 'Tudo em dia! Nenhuma tarefa pendente neste filtro.'}
          </p>
          <button
            onClick={() => onOpenQuickAdd('task')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md"
          >
            Adicionar Tarefa
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => onToggleTask(t)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                t.completed
                  ? 'bg-[#161D29]/40 border-white/5 opacity-70'
                  : 'bg-[#161D29] hover:bg-[#1A2230] border-white/10 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTask(t);
                  }}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    t.completed
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/30'
                      : 'border-2 border-slate-600 hover:border-indigo-400 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        t.completed ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {t.title}
                    </h3>
                    {getPriorityBadge(t.priority)}
                  </div>
                  {t.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{t.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="px-2 py-0.5 rounded bg-[#0F141C] text-[11px] text-slate-300">
                      {t.category}
                    </span>
                    {t.due_date && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        {t.due_date}
                      </span>
                    )}
                    {t.subtasks_count > 0 && (
                      <span className="text-[11px] font-mono text-slate-300">
                        {t.subtasks_completed}/{t.subtasks_count} subtarefas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
