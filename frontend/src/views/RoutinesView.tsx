import React, { useEffect, useState } from 'react';
import { Clock, Sun, Moon } from 'lucide-react';
import { api, type Routine } from '../api/client';

export const RoutinesView: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRoutines()
      .then((data) => setRoutines(data))
      .catch((err) => console.error('Erro ao buscar rotinas:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-400" />
          <span>Rotinas Diárias</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Sequências encadeadas de hábitos e rituais para organizar seu dia com máxima clareza.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Carregando rotinas...</div>
      ) : routines.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#161D29]/60 border border-dashed border-white/10 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Nenhuma rotina cadastrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            As rotinas combinam hábitos como alongar, tomar café sem tela e planejar o dia em uma sequência contínua.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {routines.map((routine) => {
            const isMorning = routine.name.toLowerCase().includes('matinal') || routine.name.toLowerCase().includes('manhã');
            const totalDuration = routine.items.reduce((acc, item) => acc + (item.duration_minutes || 0), 0);

            return (
              <div
                key={routine.id}
                className="p-6 rounded-2xl bg-[#161D29] border border-white/10 shadow-lg space-y-5"
              >
                {/* Routine Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isMorning
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {isMorning ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{routine.name}</h3>
                      <p className="text-xs text-slate-400">{routine.description || 'Rotina estruturada'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#0F141C] border border-white/5 text-slate-300">
                      ⏱ {totalDuration} min no total
                    </span>
                  </div>
                </div>

                {/* Items Timeline */}
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                  {routine.items.map((item, idx) => (
                    <div key={item.id} className="relative flex items-center justify-between group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 w-4 h-4 rounded-full bg-[#161D29] border-2 border-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                        {idx + 1}
                      </div>

                      <div className="ml-2 flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-200">
                          {item.title}
                        </span>
                        {item.start_time && (
                          <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">
                            {item.start_time}
                          </span>
                        )}
                      </div>

                      {item.duration_minutes && (
                        <span className="text-xs text-slate-400 font-mono">
                          {item.duration_minutes} min
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
