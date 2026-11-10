import { useState, useEffect, useCallback } from 'react';
import { Sidebar, type ActiveTab } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { QuickAddModal } from './components/QuickAddModal';
import { DashboardView } from './views/DashboardView';
import { HabitsView } from './views/HabitsView';
import { TasksView } from './views/TasksView';
import { ChallengesView } from './views/ChallengesView';
import { RoutinesView } from './views/RoutinesView';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { 
  api, 
  type HealthResponse, 
  type HabitTodayItem, 
  type TaskTodayItem 
} from './api/client';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [habits, setHabits] = useState<HabitTodayItem[]>([]);
  const [tasks, setTasks] = useState<TaskTodayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'habit' | 'task'>('habit');

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [hRes, habRes, taskRes] = await Promise.all([
        api.getHealth(),
        api.getTodayHabits(),
        api.getTodayTasks()
      ]);
      setHealth(hRes);
      setHabits(habRes);
      setTasks(taskRes);
    } catch (err: any) {
      console.error('Falha ao conectar ao backend:', err);
      setError('Não foi possível conectar ao backend local em http://127.0.0.1:8000/api/v1');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenQuickAdd = (type: 'habit' | 'task' = 'habit') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleToggleHabit = async (habit: HabitTodayItem) => {
    try {
      await api.toggleHabit(habit.id);
      loadData();
    } catch (err) {
      console.error('Erro ao alternar hábito:', err);
    }
  };

  const handleToggleTask = async (task: TaskTodayItem) => {
    try {
      await api.toggleTask(task.id);
      loadData();
    } catch (err) {
      console.error('Erro ao alternar tarefa:', err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0F141C] text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickAdd={handleOpenQuickAdd}
        health={health}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#121824] border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">LifeOS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'settings' ? 'text-indigo-400 bg-white/5' : 'text-slate-400'
              }`}
            >
              Configurações
            </button>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              title="Recarregar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Error Banner se o backend estiver inacessível */}
        {error && (
          <div className="bg-red-500/15 border-b border-red-500/30 p-3 px-4 flex items-center justify-between text-xs text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-white font-semibold transition-colors cursor-pointer"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* View Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Carregando LifeOS...</p>
            </div>
          ) : (
            <>
              {activeTab === 'today' && (
                <DashboardView
                  habits={habits}
                  tasks={tasks}
                  onReload={loadData}
                  onOpenQuickAdd={handleOpenQuickAdd}
                />
              )}

              {activeTab === 'habits' && (
                <HabitsView
                  habits={habits}
                  onOpenQuickAdd={handleOpenQuickAdd}
                  onToggleHabit={handleToggleHabit}
                />
              )}

              {activeTab === 'tasks' && (
                <TasksView
                  tasks={tasks}
                  onOpenQuickAdd={handleOpenQuickAdd}
                  onToggleTask={handleToggleTask}
                />
              )}

              {activeTab === 'challenges' && (
                <ChallengesView habits={habits} />
              )}

              {activeTab === 'routines' && <RoutinesView />}

              {activeTab === 'calendar' && <CalendarView />}

              {activeTab === 'analytics' && <AnalyticsView habits={habits} />}

              {activeTab === 'settings' && (
                <SettingsView health={health} onDataRestored={loadData} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickAdd={() => handleOpenQuickAdd('habit')}
      />

      {/* Modal Unificado de Adição Rápida */}
      <QuickAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        initialType={modalType}
      />
    </div>
  );
}

export default App;
