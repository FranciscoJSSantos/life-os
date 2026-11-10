import React from 'react';
import { Flame, Plus, CheckCircle2 } from 'lucide-react';
import type { HabitTodayItem } from '../api/client';

interface HabitsViewProps {
  habits: HabitTodayItem[];
  onOpenQuickAdd: (type: 'habit') => void;
  onToggleHabit: (habit: HabitTodayItem) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onOpenQuickAdd,
  onToggleHabit
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-400" />
            <span>Gerenciar Hábitos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe a sua consistência, metas diárias e sequências ativas.
          </p>
        </div>
        <button
          onClick={() => onOpenQuickAdd('habit')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Hábito</span>
        </button>
      </div>

      {/* Grid de Hábitos */}
      {habits.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#161D29]/60 border border-dashed border-white/10 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Flame className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Nenhum hábito cadastrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Comece com metas simples como beber água, praticar 15 minutos de leitura ou exercícios físicos.
          </p>
          <button
            onClick={() => onOpenQuickAdd('habit')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md"
          >
            Adicionar meu primeiro hábito
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((h) => (
            <div
              key={h.id}
              className="p-5 rounded-2xl bg-[#161D29] border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: h.color || '#6366F1' }}
                    />
                    <h3 className="font-bold text-base text-white truncate">{h.name}</h3>
                  </div>
                  {h.streak > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      {h.streak} dias
                    </span>
                  )}
                </div>

                {h.description && (
                  <p className="text-xs text-slate-400 mb-3">{h.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-2 border-t border-white/5">
                  <span className="px-2 py-1 rounded bg-[#0F141C] border border-white/5 text-slate-300">
                    {h.category}
                  </span>
                  <span className="px-2 py-1 rounded bg-[#0F141C] border border-white/5 text-slate-300">
                    {h.habit_type === 'BOOLEAN' ? 'Sim / Não' : h.habit_type === 'NUMERIC' ? `Meta: ${h.target_value} ${h.unit || ''}` : `Meta: ${h.target_value} min`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-xs text-slate-400">
                  Status hoje: <strong className={h.completed ? 'text-emerald-400' : 'text-slate-300'}>{h.completed ? 'Concluído' : 'Pendente'}</strong>
                </span>
                <button
                  onClick={() => onToggleHabit(h)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                    h.completed
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{h.completed ? 'Concluído' : 'Marcar Feito'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
