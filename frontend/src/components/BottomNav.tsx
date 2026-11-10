import React from 'react';
import { 
  CalendarCheck2, 
  Flame, 
  Plus, 
  Calendar as CalendarIcon, 
  MoreHorizontal 
} from 'lucide-react';
import type { ActiveTab } from './Sidebar';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickAdd
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#121824]/95 backdrop-blur-md border-t border-white/5 px-4 flex items-center justify-around z-40">
      <button
        onClick={() => onTabChange('today')}
        className={`flex flex-col items-center justify-center py-1 px-2 text-xs transition-colors cursor-pointer ${
          activeTab === 'today' ? 'text-indigo-400 font-medium' : 'text-slate-400'
        }`}
      >
        <CalendarCheck2 className="w-5 h-5 mb-0.5" />
        <span>Hoje</span>
      </button>

      <button
        onClick={() => onTabChange('habits')}
        className={`flex flex-col items-center justify-center py-1 px-2 text-xs transition-colors cursor-pointer ${
          activeTab === 'habits' ? 'text-indigo-400 font-medium' : 'text-slate-400'
        }`}
      >
        <Flame className="w-5 h-5 mb-0.5" />
        <span>Hábitos</span>
      </button>

      {/* FAB Central */}
      <button
        onClick={onOpenQuickAdd}
        className="-top-5 relative w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer border-4 border-[#0F141C]"
        aria-label="Adicionar item"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      <button
        onClick={() => onTabChange('calendar')}
        className={`flex flex-col items-center justify-center py-1 px-2 text-xs transition-colors cursor-pointer ${
          activeTab === 'calendar' ? 'text-indigo-400 font-medium' : 'text-slate-400'
        }`}
      >
        <CalendarIcon className="w-5 h-5 mb-0.5" />
        <span>Agenda</span>
      </button>

      <button
        onClick={() => onTabChange('analytics')}
        className={`flex flex-col items-center justify-center py-1 px-2 text-xs transition-colors cursor-pointer ${
          activeTab === 'analytics' || activeTab === 'settings' || activeTab === 'routines'
            ? 'text-indigo-400 font-medium'
            : 'text-slate-400'
        }`}
      >
        <MoreHorizontal className="w-5 h-5 mb-0.5" />
        <span>Mais</span>
      </button>
    </nav>
  );
};
