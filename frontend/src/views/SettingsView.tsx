import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { api, type HealthResponse } from '../api/client';

interface SettingsViewProps {
  health: HealthResponse | null;
  onDataRestored: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  health,
  onDataRestored
}) => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = async () => {
    setExporting(true);
    setMessage(null);
    try {
      const data = await api.exportBackup();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `lifeos-backup-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ text: 'Backup exportado com sucesso!', type: 'success' });
    } catch (err: any) {
      console.error('Erro ao exportar backup:', err);
      setMessage({ text: `Falha ao exportar backup: ${err.message}`, type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const parsedData = JSON.parse(text);
      await api.importBackup(parsedData);
      setMessage({ text: 'Backup restaurado com sucesso! Dados sincronizados.', type: 'success' });
      onDataRestored();
    } catch (err: any) {
      console.error('Erro ao importar backup:', err);
      setMessage({ text: `Erro na restauração: ${err.message}`, type: 'error' });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-400" />
          <span>Configurações & Backup Local</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Gerencie a persistência dos seus dados, faça backups em arquivo JSON e consulte o status do sistema.
        </p>
      </div>

      {/* Alerta de Feedback */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-fade-in ${
            message.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Seção de Backup & Restauração */}
      <div className="p-6 rounded-2xl bg-[#161D29] border border-white/10 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Privacidade & Backup Local</h3>
            <p className="text-xs text-slate-400">
              Seus dados nunca saem da sua máquina. Exporte ou restaure suas informações a qualquer momento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
          {/* Card Exportar */}
          <div className="p-4 rounded-xl bg-[#0F141C] border border-white/5 space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar Backup</span>
            </h4>
            <p className="text-xs text-slate-400">
              Gera um arquivo JSON completo contendo todas as categorias, hábitos, logs, tarefas e rotinas.
            </p>
            <button
              onClick={handleExportBackup}
              disabled={exporting}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'Exportando...' : 'Baixar Arquivo JSON'}</span>
            </button>
          </div>

          {/* Card Importar */}
          <div className="p-4 rounded-xl bg-[#0F141C] border border-white/5 space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Restaurar Backup</span>
            </h4>
            <p className="text-xs text-slate-400">
              Restaure um arquivo JSON anterior. O sistema atualizará os dados no seu banco SQLite local.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1A2230] hover:bg-white/10 active:scale-[0.98] border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{importing ? 'Importando...' : 'Selecionar Arquivo JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seção Status do Sistema */}
      <div className="p-6 rounded-2xl bg-[#161D29] border border-white/10 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Diagnóstico do Sistema Local</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F141C] border border-white/5">
            <span className="text-slate-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Banco de Dados SQLite
            </span>
            <span className="font-mono text-emerald-400 font-semibold">
              data/lifeos.db ({health?.database.status === 'connected' ? 'Conectado' : 'Online'})
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F141C] border border-white/5">
            <span className="text-slate-400 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Backend FastAPI REST
            </span>
            <span className="font-mono text-indigo-300 font-semibold">
              http://127.0.0.1:8000/api/v1 ({health?.status || 'ok'})
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F141C] border border-white/5">
            <span className="text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Frontend Framework
            </span>
            <span className="font-semibold text-slate-200">
              React 19 + Vite + Tailwind CSS v4 + Lucide React
            </span>
          </div>

          {health?.database.counts && (
            <div className="grid grid-cols-4 gap-2 pt-2">
              <div className="p-2.5 rounded-lg bg-[#0F141C] border border-white/5 text-center">
                <span className="text-slate-500 block text-[10px]">Categorias</span>
                <span className="font-mono font-bold text-white text-sm">{health.database.counts.categories}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F141C] border border-white/5 text-center">
                <span className="text-slate-500 block text-[10px]">Hábitos</span>
                <span className="font-mono font-bold text-white text-sm">{health.database.counts.habits}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F141C] border border-white/5 text-center">
                <span className="text-slate-500 block text-[10px]">Tarefas</span>
                <span className="font-mono font-bold text-white text-sm">{health.database.counts.tasks}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F141C] border border-white/5 text-center">
                <span className="text-slate-500 block text-[10px]">Rotinas</span>
                <span className="font-mono font-bold text-white text-sm">{health.database.counts.routines}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
