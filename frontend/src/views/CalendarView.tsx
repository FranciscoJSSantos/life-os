import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  CheckSquare, 
  Square, 
  MessageSquare, 
  X, 
  Save,
  Sun,
  Moon
} from 'lucide-react';
import { api, type CalendarMonthRead, type HabitTodayItem, type TaskTodayItem } from '../api/client';

export const CalendarView: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1);
  const [calendarData, setCalendarData] = useState<CalendarMonthRead | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);
  const [dayHabits, setDayHabits] = useState<HabitTodayItem[]>([]);
  const [dayTasks, setDayTasks] = useState<TaskTodayItem[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Estado para Modal de Observação / Sintomas
  const [noteModalHabit, setNoteModalHabit] = useState<HabitTodayItem | null>(null);
  const [noteModalPeriod, setNoteModalPeriod] = useState<string | undefined>(undefined);
  const [noteInput, setNoteInput] = useState<string>('');
  const [savingNote, setSavingNote] = useState<boolean>(false);

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

  // Alternar Hábito na data selecionada (com suporte a período)
  const handleToggleHabit = async (habit: HabitTodayItem, period?: string) => {
    setLoadingAction(`habit-${habit.id}-${period || 'all'}`);
    try {
      await api.toggleHabit(habit.id, selectedDate, undefined, undefined, period);
      await Promise.all([
        fetchDayDetails(selectedDate),
        fetchMonth(currentYear, currentMonth)
      ]);
    } catch (err) {
      console.error('Erro ao alternar hábito na data:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  // Alternar Tarefa na data selecionada
  const handleToggleTask = async (task: TaskTodayItem) => {
    setLoadingAction(`task-${task.id}`);
    try {
      await api.toggleTask(task.id);
      await Promise.all([
        fetchDayDetails(selectedDate),
        fetchMonth(currentYear, currentMonth)
      ]);
    } catch (err) {
      console.error('Erro ao alternar tarefa na data:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  // Abrir Modal de Observação
  const handleOpenNoteModal = (habit: HabitTodayItem, period?: string) => {
    setNoteModalHabit(habit);
    setNoteModalPeriod(period);

    if (period && habit.period_statuses) {
      const ps = habit.period_statuses.find(p => p.period === period);
      setNoteInput(ps?.notes || '');
    } else {
      setNoteInput(habit.notes || '');
    }
  };

  // Salvar Observação
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalHabit) return;

    setSavingNote(true);
    try {
      await api.toggleHabit(noteModalHabit.id, selectedDate, undefined, noteInput.trim(), noteModalPeriod);
      setNoteModalHabit(null);
      setNoteModalPeriod(undefined);
      await Promise.all([
        fetchDayDetails(selectedDate),
        fetchMonth(currentYear, currentMonth)
      ]);
    } catch (err) {
      console.error('Erro ao salvar observação do hábito:', err);
      alert('Falha ao salvar observação.');
    } finally {
      setSavingNote(false);
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
            Selecione qualquer dia para conferir, marcar doses por período (Manhã e Noite) e registrar sintomas.
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

              // Cores: 80%+ Verde, 25%-79% Amarelo/Âmbar (ex: 50% fica amarelo brilhante), >0% Índigo
              let rateBg = 'bg-slate-800/40 text-slate-500';
              if (rate >= 80) {
                rateBg = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
              } else if (rate >= 25) {
                rateBg = 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold';
              } else if (rate > 0) {
                rateBg = 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
              }

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

        {/* Detalhes do Dia Selecionado (Interativo) */}
        <div className="bg-[#161D29] p-5 rounded-2xl border border-white/10 shadow-lg space-y-5">
          <div className="border-b border-white/10 pb-3 flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold block">
                Dia Selecionado
              </span>
              <h3 className="text-base font-bold text-white capitalize mt-0.5">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short'
                })}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#0F141C] border border-white/10 text-slate-300">
              {selectedDate}
            </span>
          </div>

          {/* Hábitos do dia (Check por Período + Obs) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Hábitos do Dia</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {dayHabits.filter(h => h.completed).length}/{dayHabits.length} concluídos
              </span>
            </h4>

            {dayHabits.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">Nenhum hábito programado para este dia.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {dayHabits.map((h) => {
                  const isMultiPeriod = Boolean(h.periods && h.periods.length > 0);
                  const isDone = h.completed;
                  const isPartial = Boolean(h.is_partial);

                  return (
                    <div
                      key={h.id}
                      className={`p-3 rounded-xl text-xs border transition-all space-y-2.5 ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
                          : isPartial
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : 'bg-[#0F141C] border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: h.color || '#06B6D4' }}
                          />
                          <span className="font-bold truncate text-white">{h.name}</span>
                        </div>

                        {/* Badge de Status */}
                        {isDone ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                            100% Feito
                          </span>
                        ) : isPartial ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                            {Math.round(h.completion_rate || 50)}% Parcial
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] text-slate-500 shrink-0">
                            Pendente
                          </span>
                        )}
                      </div>

                      {/* Se tiver múltiplos períodos (Manhã e Noite) */}
                      {isMultiPeriod && h.period_statuses && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {h.period_statuses.map((ps) => {
                            const isMorning = ps.period.toLowerCase().includes('manhã');
                            const isBusy = loadingAction === `habit-${h.id}-${ps.period}`;

                            return (
                              <div
                                key={ps.period}
                                className={`p-2 rounded-lg border flex items-center justify-between gap-1.5 ${
                                  ps.completed
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                                    : 'bg-[#121824] border-white/10 text-slate-400'
                                }`}
                              >
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleToggleHabit(h, ps.period)}
                                  className="flex items-center gap-1.5 cursor-pointer text-left min-w-0"
                                >
                                  {ps.completed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  )}
                                  <span className="text-[11px] font-semibold truncate flex items-center gap-1">
                                    {isMorning ? <Sun className="w-3 h-3 text-cyan-400" /> : <Moon className="w-3 h-3 text-purple-400" />}
                                    <span>{ps.period}</span>
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenNoteModal(h, ps.period)}
                                  className={`p-1 rounded text-[10px] cursor-pointer ${
                                    ps.notes ? 'text-cyan-300 bg-cyan-500/20 rounded' : 'text-slate-500 hover:text-white'
                                  }`}
                                  title={ps.notes ? `Sintomas (${ps.period})` : `Adicionar sintomas (${ps.period})`}
                                >
                                  <MessageSquare className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Se for evento simples */}
                      {!isMultiPeriod && (
                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => handleToggleHabit(h)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-500" />
                            )}
                            <span className="text-xs font-semibold">{isDone ? 'Concluído' : 'Marcar Feito'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenNoteModal(h)}
                            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer ${
                              h.notes
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{h.notes ? 'Ver Obs' : '+ Obs'}</span>
                          </button>
                        </div>
                      )}

                      {/* Exibir notas de sintomas existentes */}
                      {h.notes && (
                        <div 
                          onClick={() => handleOpenNoteModal(h)}
                          className="pt-1.5 border-t border-white/5 text-[11px] text-cyan-300 italic flex items-start gap-1 cursor-pointer hover:underline"
                        >
                          <span>💬 {h.notes}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tarefas do dia (Interativo) */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Tarefas Agendadas</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {dayTasks.filter(t => t.completed).length}/{dayTasks.length} concluídas
              </span>
            </h4>

            {dayTasks.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-1">Nenhuma tarefa agendada neste dia.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {dayTasks.map((t) => {
                  const isActionLoading = loadingAction === `task-${t.id}`;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleToggleTask(t)}
                      disabled={isActionLoading}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs border text-left transition-all cursor-pointer ${
                        t.completed
                          ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300'
                          : 'bg-[#0F141C] border-white/5 text-slate-300 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {t.completed ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className={`font-medium truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          {t.title}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] shrink-0 text-slate-500">
                        {t.completed ? 'Concluída' : 'Pendente'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Adicionar / Editar Observação & Sintomas */}
      {noteModalHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#161D29] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 bg-[#121824] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">Observação & Sintomas</h3>
                  <p className="text-[11px] text-slate-400">
                    {noteModalHabit.name} {noteModalPeriod ? `(${noteModalPeriod})` : ''} em {selectedDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setNoteModalHabit(null);
                  setNoteModalPeriod(undefined);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descreva como foi a aplicação, sintomas ou observações do dia:
                </label>
                <textarea
                  rows={4}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Ex: Aplicação realizada pela manhã; senti leve dor de cabeça 1h depois; boa hidratação ao longo do dia..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0F141C] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 resize-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setNoteInput('');
                  }}
                  className="text-[11px] text-red-400 hover:underline cursor-pointer"
                >
                  Limpar nota
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNoteModalHabit(null);
                      setNoteModalPeriod(undefined);
                    }}
                    className="px-3 py-1.5 rounded-xl text-slate-400 text-xs font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingNote}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-cyan-600/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingNote ? 'Salvando...' : 'Salvar Observação'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
