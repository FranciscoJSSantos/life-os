import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type CalendarMonthRead, type HabitTodayItem, type TaskTodayItem } from '../api/client';

export const CalendarView: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1);
  const [calendarData, setCalendarData] = useState<CalendarMonthRead | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);
  const [dayHabits, setDayHabits] = useState<HabitTodayItem[]>([]);
  const [dayTasks, setDayTasks] = useState<TaskTodayItem[]>([]);

  const fetchMonth = async (year: number, month: number) => {
    try {
      const data = await api.getCalendar(year, month);
      setCalendarData(data);
    } catch (err) {
      console.error('Erro ao buscar dados do calendário:', err);
    }
  };

  const fetchDayDetails = async (dateStr: string) => {
    try {
      const [habits, tasks] = await Promise.all([
        api.getTodayHabits(dateStr),
        api.getTodayTasks(dateStr)
      ]);
      setDayHabits(habits);
      setDayTasks(tasks);
    } catch (err) {
      console.error('Erro ao buscar detalhes do dia:', err);
    }
  };

  useEffect(() => {
    fetchMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchDayDetails(selectedDate);
  }, [selectedDate]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekdayHeaders = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  // Determinar padding no início do mês
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  // Ajuste para começar na Segunda (0 = Seg, 6 = Dom)
  const offsetDays = (firstDayOfMonth + 6) % 7;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-400" />
            <span>Calendário & Histórico</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Navegue pelo histórico diário e visualize a consistência ao longo dos meses.
          </p>
        </div>

        {/* Controles de Navegação */}
        <div className="flex items-center gap-2 bg-[#161D29] p-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-white px-3 min-w-36 text-center">
            {monthNames[currentMonth - 1]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid do Calendário */}
        <div className="lg:col-span-2 bg-[#161D29] p-5 rounded-2xl border border-white/10 shadow-lg">
          <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-semibold text-slate-400">
            {weekdayHeaders.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Células vazias para offset */}
            {Array.from({ length: offsetDays }).map((_, idx) => (
              <div key={`offset-${idx}`} className="h-16 rounded-xl bg-transparent" />
            ))}

            {/* Dias do Mês */}
            {calendarData?.days.map((day) => {
              const isSelected = selectedDate === day.date;
              const rate = Math.round(day.completion_rate);
              const dayNum = parseInt(day.date.split('-')[2], 10);

              let rateBg = 'bg-slate-800/40 text-slate-500';
              if (rate >= 80) rateBg = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
              else if (rate >= 50) rateBg = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
              else if (rate > 0) rateBg = 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className={`h-16 p-2 rounded-xl border flex flex-col justify-between items-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600/20 shadow-md ring-2 ring-indigo-500/30'
                      : 'border-white/5 bg-[#0F141C] hover:bg-[#1A2230] hover:border-white/20'
                  }`}
                >
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {dayNum}
                  </span>

                  {day.habits_total > 0 || day.tasks_total > 0 ? (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${rateBg}`}>
                      {rate}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-mono">-</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalhes do Dia Selecionado */}
        <div className="bg-[#161D29] p-5 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <div className="border-b border-white/10 pb-3">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold block">
              Detalhes do Dia
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </h3>
          </div>

          {/* Hábitos do dia */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Hábitos Registrados</span>
              <span className="text-slate-400 font-mono">
                {dayHabits.filter(h => h.completed).length}/{dayHabits.length}
              </span>
            </h4>
            {dayHabits.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nenhum hábito registrado neste dia.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {dayHabits.map((h) => (
                  <div
                    key={h.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                      h.completed
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : 'bg-[#0F141C] border-white/5 text-slate-400'
                    }`}
                  >
                    <span className="font-medium truncate">{h.name}</span>
                    <span className="font-mono text-[11px] shrink-0">
                      {h.completed ? '✓ Feito' : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tarefas do dia */}
          <div className="pt-2 border-t border-white/5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Tarefas Agendadas</span>
              <span className="text-slate-400 font-mono">
                {dayTasks.filter(t => t.completed).length}/{dayTasks.length}
              </span>
            </h4>
            {dayTasks.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nenhuma tarefa agendada neste dia.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                      t.completed
                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                        : 'bg-[#0F141C] border-white/5 text-slate-400'
                    }`}
                  >
                    <span className="font-medium truncate">{t.title}</span>
                    <span className="font-mono text-[11px] shrink-0">
                      {t.completed ? '✓ Concluída' : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
