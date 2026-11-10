import React, { useState, useEffect } from 'react';
import { Flame, Plus, CheckCircle2, Pencil, Trash2, X, Tag, Target } from 'lucide-react';
import { api, type HabitTodayItem, type Category } from '../api/client';

interface HabitsViewProps {
  habits: HabitTodayItem[];
  onOpenQuickAdd: (type: 'habit') => void;
  onToggleHabit: (habit: HabitTodayItem) => void;
  onReload: () => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onOpenQuickAdd,
  onToggleHabit,
  onReload
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Estado para Edição de Hábito
  const [editingHabit, setEditingHabit] = useState<HabitTodayItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editHabitType, setEditHabitType] = useState<'BOOLEAN' | 'NUMERIC' | 'DURATION'>('BOOLEAN');
  const [editTargetValue, setEditTargetValue] = useState(1);
  const [editUnit, setEditUnit] = useState('');
  const [editPeriods, setEditPeriods] = useState('');
  const [editColor, setEditColor] = useState('#10B981');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleOpenEdit = (h: HabitTodayItem) => {
    setEditingHabit(h);
    setEditName(h.name);
    setEditDesc(h.description || '');
    setEditCategoryId(h.category_id || '');
    setEditHabitType(h.habit_type);
    setEditTargetValue(h.target_value);
    setEditUnit(h.unit || '');
    setEditPeriods(h.periods && h.periods.length > 0 ? h.periods.join(',') : '');
    setEditColor(h.color || '#10B981');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit || !editName.trim()) return;
    setSaving(true);
    try {
      await api.updateHabit(editingHabit.id, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
        category_id: editCategoryId || undefined,
        habit_type: editHabitType,
        target_value: Number(editTargetValue) || 1,
        unit: editHabitType === 'BOOLEAN' ? undefined : (editUnit.trim() || undefined),
        periods: editPeriods.trim() || undefined,
        color: editColor
      });
      setEditingHabit(null);
      onReload();
    } catch (err) {
      console.error('Erro ao atualizar hábito:', err);
      alert('Falha ao atualizar hábito. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHabit = async (h: HabitTodayItem) => {
    if (!window.confirm(`Tem certeza que deseja excluir o hábito "${h.name}"?\nIsso removerá o hábito e seus registros associados.`)) {
      return;
    }
    setDeletingId(h.id);
    try {
      await api.deleteHabit(h.id, true);
      onReload();
    } catch (err) {
      console.error('Erro ao excluir hábito:', err);
      alert('Falha ao excluir hábito.');
    } finally {
      setDeletingId(null);
    }
  };

  const colors = [
    { label: 'Esmeralda', value: '#10B981' },
    { label: 'Ciano', value: '#06B6D4' },
    { label: 'Índigo', value: '#6366F1' },
    { label: 'Âmbar', value: '#F59E0B' },
    { label: 'Rosa', value: '#EC4899' },
    { label: 'Roxo', value: '#8B5CF6' },
  ];

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
            Acompanhe a sua consistência, edite metas e remova hábitos quando necessário.
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
            Cadastre os seus hábitos ou protocolos para começar a rastrear a consistência.
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
              className="p-5 rounded-2xl bg-[#161D29] border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-4 shadow-sm relative group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: h.color || '#6366F1' }}
                    />
                    <h3 className="font-bold text-base text-white truncate">{h.name}</h3>
                  </div>

                  {/* Ações: Streak + Editar + Excluir */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {h.streak > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        {h.streak}d
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenEdit(h)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Editar Hábito"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteHabit(h)}
                      disabled={deletingId === h.id}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                      title="Excluir Hábito"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {h.description && (
                  <p className="text-xs text-slate-400 mb-3">{h.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-2 border-t border-white/5">
                  <span className="px-2 py-1 rounded bg-[#0F141C] border border-white/5 text-slate-300 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-500" />
                    {h.category}
                  </span>
                  <span className="px-2 py-1 rounded bg-[#0F141C] border border-white/5 text-slate-300 flex items-center gap-1">
                    <Target className="w-3 h-3 text-slate-500" />
                    {h.habit_type === 'BOOLEAN' ? 'Sim / Não' : h.habit_type === 'NUMERIC' ? `Meta: ${h.target_value} ${h.unit || ''}` : `Meta: ${h.target_value} min`}
                  </span>
                  {h.periods && h.periods.length > 0 && (
                    <span className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold">
                      ☀️🌙 {h.periods.join(' & ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-xs text-slate-400">
                  Status hoje: <strong className={
                    h.completed 
                      ? 'text-emerald-400' 
                      : h.is_partial 
                      ? 'text-amber-400' 
                      : 'text-slate-300'
                  }>
                    {h.completed ? '100% Concluído' : h.is_partial ? `${Math.round(h.completion_rate || 50)}% Parcial` : 'Pendente'}
                  </strong>
                </span>
                <button
                  onClick={() => onToggleHabit(h)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                    h.completed
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
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

      {/* Modal de Editar Hábito */}
      {editingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#161D29] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 bg-[#121824] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Editar Hábito</h3>
              </div>
              <button
                onClick={() => setEditingHabit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Hábito *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Meta
                  </label>
                  <select
                    value={editHabitType}
                    onChange={(e) => setEditHabitType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BOOLEAN">Sim / Não (Check simples)</option>
                    <option value="NUMERIC">Numérico (Contador / Doses)</option>
                    <option value="DURATION">Duração (Minutos)</option>
                  </select>
                </div>
              </div>

              {editHabitType !== 'BOOLEAN' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Meta Diária
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={editTargetValue}
                      onChange={(e) => setEditTargetValue(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Unidade de Medida
                    </label>
                    <input
                      type="text"
                      placeholder="ex: ml, doses, páginas"
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0F141C] border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Eventos / Períodos no Dia */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Eventos / Turnos no Dia (Permite medir 50% parcial)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditPeriods('');
                      if (editHabitType === 'BOOLEAN') setEditTargetValue(1);
                    }}
                    className={`p-2 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                      !editPeriods
                        ? 'border-indigo-500 bg-indigo-500/15 text-white'
                        : 'border-white/5 bg-[#0F141C] text-slate-400 hover:text-white'
                    }`}
                  >
                    1x ao dia (Dia todo)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditPeriods('Manhã,Noite');
                      setEditTargetValue(2);
                      setEditUnit('doses');
                      setEditHabitType('NUMERIC');
                    }}
                    className={`p-2 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                      editPeriods === 'Manhã,Noite'
                        ? 'border-cyan-500 bg-cyan-500/15 text-cyan-200'
                        : 'border-white/5 bg-[#0F141C] text-slate-400 hover:text-white'
                    }`}
                  >
                    2x ao dia (Manhã & Noite)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditPeriods('Manhã,Tarde,Noite');
                      setEditTargetValue(3);
                      setEditUnit('doses');
                      setEditHabitType('NUMERIC');
                    }}
                    className={`p-2 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                      editPeriods === 'Manhã,Tarde,Noite'
                        ? 'border-purple-500 bg-purple-500/15 text-purple-200'
                        : 'border-white/5 bg-[#0F141C] text-slate-400 hover:text-white'
                    }`}
                  >
                    3x ao dia (3 Turnos)
                  </button>
                </div>
                {editPeriods && (
                  <p className="text-[11px] text-cyan-400">
                    Turnos vinculados: <strong>{editPeriods.split(',').join(' e ')}</strong>. Cada turno terá seu próprio check no dia.
                  </p>
                )}
              </div>

              {/* Seletor de Cores */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Cor de Identificação
                </label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setEditColor(c.value)}
                      className={`w-7 h-7 rounded-full transition-all cursor-pointer ${
                        editColor === c.value ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingHabit(null)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !editName.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
