import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Flame, 
  TrendingUp, 
  CheckSquare, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { api, type AnalyticsOverview, type HeatmapDay, type HabitTodayItem } from '../api/client';

interface AnalyticsViewProps {
  habits: HabitTodayItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ habits }) => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('');
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);

  useEffect(() => {
    api.getAnalyticsOverview()
      .then((data) => setOverview(data))
      .catch((err) => console.error('Erro ao buscar overview analítico:', err));
  }, []);

  useEffect(() => {
    if (habits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(habits[0].id);
    }
  }, [habits, selectedHabitId]);

  useEffect(() => {
    if (selectedHabitId) {
      api.getHabitHeatmap(selectedHabitId)
        .then((days) => setHeatmap(days))
        .catch((err) => console.error('Erro ao buscar heatmap:', err));
    }
  }, [selectedHabitId]);

  const getHeatmapColor = (intensity: number) => {
    switch (intensity) {
      case 4:
        return 'bg-emerald-400 shadow-sm shadow-emerald-400/50';
      case 3:
        return 'bg-emerald-500';
      case 2:
        return 'bg-emerald-600';
      case 1:
        return 'bg-emerald-800/80';
      default:
        return 'bg-slate-800/50 border border-white/5';
    }
  };

  const selectedHabit = habits.find((h) => h.id === selectedHabitId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <span>Métricas & Consistência</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Estatísticas globais e mapa térmico de consistência estilo HabitNow.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Taxa Semanal */}
        <div className="p-4 rounded-2xl bg-[#161D29] border border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Taxa Semanal</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {overview ? `${Math.round(overview.weekly_completion_rate)}%` : '--%'}
          </p>
          <p className="text-[11px] text-slate-500">Últimos 7 dias</p>
        </div>

        {/* Card 2: Maior Sequência */}
        <div className="p-4 rounded-2xl bg-[#161D29] border border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Melhor Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {overview ? `${overview.best_streak_count}d` : '0d'}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {overview?.best_streak_habit || 'Nenhuma sequência'}
          </p>
        </div>

        {/* Card 3: Hábitos Ativos */}
        <div className="p-4 rounded-2xl bg-[#161D29] border border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Hábitos Ativos</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {overview ? overview.active_habits : 0}
          </p>
          <p className="text-[11px] text-slate-500">
            {overview?.total_completed_logs || 0} checks registrados
          </p>
        </div>

        {/* Card 4: Tarefas Concluídas */}
        <div className="p-4 rounded-2xl bg-[#161D29] border border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Tarefas Feitas</span>
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {overview ? overview.completed_tasks : 0}
          </p>
          <p className="text-[11px] text-slate-500">
            Total de {overview?.total_tasks || 0} cadastradas
          </p>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="p-6 rounded-2xl bg-[#161D29] border border-white/10 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Mapa Térmico de Hábitos (Heatmap)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Visualização de consistência diária dos últimos meses.
            </p>
          </div>

          {/* Seletor de Hábito */}
          {habits.length > 0 && (
            <select
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#0F141C] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.streak}d streak)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Heatmap Grid */}
        {selectedHabit ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: selectedHabit.color || '#6366F1' }}
              />
              <span className="font-semibold text-slate-200">{selectedHabit.name}</span>
              <span>•</span>
              <span>Sequência atual: <strong className="text-amber-400">{selectedHabit.streak} dias</strong></span>
            </div>

            {/* Grid de Dias */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-1.5 min-w-[600px] flex-wrap">
                {heatmap.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.value}/${day.target_value} (Intensidade ${day.intensity})`}
                    className={`w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer ${getHeatmapColor(
                      day.intensity
                    )}`}
                  />
                ))}
              </div>
            </div>

            {/* Legenda de Intensidade */}
            <div className="flex items-center justify-end gap-2 text-[11px] text-slate-400 pt-2 border-t border-white/5">
              <span>Menos</span>
              <div className="w-3 h-3 rounded-sm bg-slate-800/50 border border-white/5" />
              <div className="w-3 h-3 rounded-sm bg-emerald-800/80" />
              <div className="w-3 h-3 rounded-sm bg-emerald-600" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400" />
              <span>Mais</span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            Nenhum hábito cadastrado para exibir o mapa térmico.
          </div>
        )}
      </div>
    </div>
  );
};
