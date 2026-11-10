import React from 'react';
import { 
  CalendarCheck2, 
  Flame, 
  CheckSquare, 
  Clock, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings as SettingsIcon, 
  Plus, 
  Database,
  Sparkles
} from 'lucide-react';
import type { HealthResponse } from '../api/client';

export type ActiveTab = 'today' | 'habits' | 'tasks' | 'routines' | 'calendar' | 'analytics' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenQuickAdd: (defaultType?: 'habit' | 'task') => void;
  health: HealthResponse | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickAdd,
  health
}) => {
  const navItems = [
    { id: 'today', label: 'Hoje', icon: CalendarCheck2 },
    { id: 'habits', label: 'Hábitos', icon: Flame },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'routines', label: 'Rotinas', icon: Clock },
    { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
    { id: 'analytics', label: 'Métricas', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  ] as const;

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#121824] p-4 select-none shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
            LifeOS
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Local
            </span>
          </h1>
          <p className="text-xs text-slate-400">HabitNow Web & PWA</p>
        </div>
      </div>

      {/* Quick Add Button */}
      <button
        onClick={() => onOpenQuickAdd('habit')}
        className="w-full mb-6 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-[0.98] cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Novo Item</span>
      </button>

      {/* Nav List */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as ActiveTab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Database & System Info */}
      <div className="pt-4 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between px-2 text-xs">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            SQLite Local
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {health?.status === 'ok' ? 'Online' : 'Conectando'}
          </span>
        </div>
        <div className="px-2 py-2 rounded-lg bg-[#0F141C] text-[11px] text-slate-400 flex justify-between border border-white/5">
          <span>Hábitos: <strong className="text-slate-200">{health?.database.counts.habits ?? 0}</strong></span>
          <span>Tarefas: <strong className="text-slate-200">{health?.database.counts.tasks ?? 0}</strong></span>
          <span>Rotinas: <strong className="text-slate-200">{health?.database.counts.routines ?? 0}</strong></span>
        </div>
      </div>
    </aside>
  );
};
