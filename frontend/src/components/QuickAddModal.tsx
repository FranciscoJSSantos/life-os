import React, { useState, useEffect } from 'react';
import { X, Flame, CheckSquare, Plus, Trash2, Clock, Sparkles } from 'lucide-react';
import { api, type Category, type CreateHabitDto, type CreateTaskDto } from '../api/client';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: 'habit' | 'task';
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'habit'
}) => {
  const [activeTab, setActiveTab] = useState<'habit' | 'task'>(initialType);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos do Hábito
  const [habitName, setHabitName] = useState('');
  const [habitDesc, setHabitDesc] = useState('');
  const [habitCategory, setHabitCategory] = useState<string>('');
  const [habitType, setHabitType] = useState<'BOOLEAN' | 'NUMERIC' | 'DURATION'>('BOOLEAN');
  const [targetValue, setTargetValue] = useState<number>(1);
  const [unit, setUnit] = useState<string>('');
  const [habitPeriods, setHabitPeriods] = useState<string>('');
  const [freqType, setFreqType] = useState<'DAILY' | 'WEEKLY_DAYS'>('DAILY');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  // Campos da Tarefa
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [subtasks, setSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialType);
      setError(null);
      api.getCategories()
        .then((cats) => {
          setCategories(cats);
          if (cats.length > 0) {
            setHabitCategory(cats[0].id);
            setTaskCategory(cats[0].id);
          }
        })
        .catch((err) => console.error('Erro ao carregar categorias:', err));
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const toggleWeekday = (day: number) => {
    if (selectedWeekdays.includes(day)) {
      if (selectedWeekdays.length > 1) {
        setSelectedWeekdays(selectedWeekdays.filter(d => d !== day));
      }
    } else {
      setSelectedWeekdays([...selectedWeekdays, day].sort());
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), completed: false }]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmitHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) {
      setError('Por favor, informe o nome do hábito.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const payload: CreateHabitDto = {
        name: habitName.trim(),
        description: habitDesc.trim() || undefined,
        category_id: habitCategory || undefined,
        habit_type: habitPeriods ? 'NUMERIC' : habitType,
        target_value: habitPeriods ? habitPeriods.split(',').length : (habitType === 'BOOLEAN' ? 1 : Number(targetValue)),
        unit: habitPeriods ? 'doses' : (habitType === 'NUMERIC' ? (unit || 'vezes') : (habitType === 'DURATION' ? 'min' : undefined)),
        periods: habitPeriods || undefined,
        schedule: {
          frequency_type: freqType,
          weekdays: freqType === 'WEEKLY_DAYS' ? selectedWeekdays.join(',') : '0,1,2,3,4,5,6'
        }
      };

      await api.createHabit(payload);
      // Reset form
      setHabitName('');
      setHabitDesc('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar hábito');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setError('Por favor, informe o título da tarefa.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const payload: CreateTaskDto = {
        title: taskTitle.trim(),
        description: taskDesc.trim() || undefined,
        category_id: taskCategory || undefined,
        priority: taskPriority,
        due_date: dueDate || undefined,
        subtasks: subtasks.length > 0 ? subtasks : undefined
      };

      await api.createTask(payload);
      // Reset form
      setTaskTitle('');
      setTaskDesc('');
      setSubtasks([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const weekdaysLabels = [
    { label: 'Seg', val: 0 },
    { label: 'Ter', val: 1 },
    { label: 'Qua', val: 2 },
    { label: 'Qui', val: 3 },
    { label: 'Sex', val: 4 },
    { label: 'Sáb', val: 5 },
    { label: 'Dom', val: 6 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#161D29] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header com Tabs */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#121824]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('habit')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'habit'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Novo Hábito</span>
            </button>
            <button
              onClick={() => setActiveTab('task')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'task'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Nova Tarefa</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-3 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs px-4">
            {error}
          </div>
        )}

        {/* Formulário scrollável */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'habit' ? (
            <form id="habit-form" onSubmit={handleSubmitHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome do Hábito *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Beber 2L de Água, Meditar, Ler Livro..."
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Detalhes ou motivação..."
                  value={habitDesc}
                  onChange={(e) => setHabitDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Categorias */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Categoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setHabitCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                        habitCategory === cat.id
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-sm'
                          : 'border-white/5 bg-[#0F141C] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eventos / Turnos no Dia */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Frequência Diária / Turnos
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHabitPeriods('');
                    }}
                    className={`p-2 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                      !habitPeriods
                        ? 'border-indigo-500 bg-indigo-500/15 text-white'
                        : 'border-white/5 bg-[#0F141C] text-slate-400 hover:text-white'
                    }`}
                  >
                    1x ao dia
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHabitPeriods('Manhã,Noite');
                    }}
                    className={`p-2 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                      habitPeriods === 'Manhã,Noite'
                        ? 'border-cyan-500 bg-cyan-500/15 text-cyan-200'
                        : 'border-white/5 bg-[#0F141C] text-slate-400 hover:text-white'
                    }`}
                  >
                    2x (Manhã & Noite)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHabitPeriods('Manhã,Tarde,Noite');
                    }}
                    className={`p-2 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                      habitPeriods === 'Manhã,Tarde,Noite'
                        ? 'border-purple-500 bg-purple-500/15 text-purple-200'
                        : 'border-white/5 bg-[#0F141C] text-slate-400 hover:text-white'
                    }`}
                  >
                    3x (3 Turnos)
                  </button>
                </div>
                {habitPeriods && (
                  <p className="text-[11px] text-cyan-400 mt-1">
                    Cria checks separados para cada turno ({habitPeriods.split(',').join(' e ')}) e permite marcar 50% parcial!
                  </p>
                )}
              </div>

              {/* Tipo de Hábito */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tipo de Registro
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setHabitType('BOOLEAN')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      habitType === 'BOOLEAN'
                        ? 'border-indigo-500 bg-indigo-500/15 text-white'
                        : 'border-white/5 bg-[#0F141C] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mx-auto mb-1 text-indigo-400" />
                    <span className="text-xs font-medium block">Sim / Não</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHabitType('NUMERIC');
                      if (targetValue <= 1) setTargetValue(2000);
                      if (!unit) setUnit('ml');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      habitType === 'NUMERIC'
                        ? 'border-indigo-500 bg-indigo-500/15 text-white'
                        : 'border-white/5 bg-[#0F141C] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Plus className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <span className="text-xs font-medium block">Numérico</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHabitType('DURATION');
                      if (targetValue <= 1) setTargetValue(30);
                      setUnit('min');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      habitType === 'DURATION'
                        ? 'border-indigo-500 bg-indigo-500/15 text-white'
                        : 'border-white/5 bg-[#0F141C] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <span className="text-xs font-medium block">Tempo</span>
                  </button>
                </div>
              </div>

              {/* Parâmetros se for Numérico ou Duração */}
              {habitType === 'NUMERIC' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0F141C] border border-white/5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Meta Diária
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={targetValue}
                      onChange={(e) => setTargetValue(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#161D29] border border-white/10 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Unidade (Ex: ml, páginas, copos)
                    </label>
                    <input
                      type="text"
                      placeholder="ml, páginas..."
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#161D29] border border-white/10 text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {habitType === 'DURATION' && (
                <div className="p-3 rounded-xl bg-[#0F141C] border border-white/5">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Meta de Tempo (em Minutos)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={targetValue}
                      onChange={(e) => setTargetValue(Number(e.target.value))}
                      className="w-32 px-3 py-1.5 rounded-lg bg-[#161D29] border border-white/10 text-white text-sm"
                    />
                    <span className="text-sm text-slate-400">minutos por dia</span>
                  </div>
                </div>
              )}

              {/* Frequência */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Frequência
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setFreqType('DAILY')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      freqType === 'DAILY'
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                        : 'border-white/5 bg-[#0F141C] text-slate-400'
                    }`}
                  >
                    Todos os Dias
                  </button>
                  <button
                    type="button"
                    onClick={() => setFreqType('WEEKLY_DAYS')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      freqType === 'WEEKLY_DAYS'
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                        : 'border-white/5 bg-[#0F141C] text-slate-400'
                    }`}
                  >
                    Dias da Semana
                  </button>
                </div>

                {freqType === 'WEEKLY_DAYS' && (
                  <div className="grid grid-cols-7 gap-1 pt-1">
                    {weekdaysLabels.map((d) => {
                      const isSel = selectedWeekdays.includes(d.val);
                      return (
                        <button
                          key={d.val}
                          type="button"
                          onClick={() => toggleWeekday(d.val)}
                          className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isSel
                              ? 'bg-indigo-600 text-white'
                              : 'bg-[#0F141C] text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </form>
          ) : (
            <form id="task-form" onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Entregar relatório trimestral..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Instruções ou notas..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Categorias */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Categoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTaskCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                        taskCategory === cat.id
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-sm'
                          : 'border-white/5 bg-[#0F141C] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prioridade e Data */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Prioridade
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Data Limite
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Subtarefas */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subtarefas (Checklist)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Adicionar subtarefa..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#0F141C] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {subtasks.length > 0 && (
                  <ul className="space-y-1.5 max-h-36 overflow-y-auto p-1">
                    {subtasks.map((st, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0F141C] border border-white/5 text-xs text-slate-300"
                      >
                        <span>{st.title}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(index)}
                          className="text-slate-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#121824] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={activeTab === 'habit' ? 'habit-form' : 'task-form'}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-sm font-medium shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Salvando...</span>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Salvar {activeTab === 'habit' ? 'Hábito' : 'Tarefa'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
