import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private apiService = inject(ApiService);

  protected readonly isExporting = signal<boolean>(false);
  protected readonly isImporting = signal<boolean>(false);
  protected readonly feedbackMessage = signal<string | null>(null);
  protected readonly feedbackType = signal<'success' | 'error'>('success');

  downloadBackup(): void {
    this.isExporting.set(true);
    this.feedbackMessage.set(null);

    this.apiService.exportBackup().subscribe({
      next: (data) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const nowStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `lifeos-backup-${nowStr}.json`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.isExporting.set(false);
        this.feedbackType.set('success');
        this.feedbackMessage.set('Backup exportado com sucesso! Arquivo baixado.');
      },
      error: (err) => {
        console.error('Erro ao exportar:', err);
        this.isExporting.set(false);
        this.feedbackType.set('error');
        this.feedbackMessage.set('Falha ao exportar backup. Verifique se o backend está ativo.');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    this.isImporting.set(true);
    this.feedbackMessage.set(null);

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        this.apiService.importBackup(json).subscribe({
          next: (res) => {
            this.isImporting.set(false);
            this.feedbackType.set('success');
            this.feedbackMessage.set(`Restauração concluída com sucesso! ${res.records_restored.habits} hábitos e ${res.records_restored.tasks} tarefas restaurados.`);
            this.apiService.notifyDataChanged();
          },
          error: (err) => {
            console.error('Erro na importação:', err);
            this.isImporting.set(false);
            this.feedbackType.set('error');
            this.feedbackMessage.set('Erro ao importar backup. Arquivo inválido ou corrompido.');
          }
        });
      } catch (err) {
        this.isImporting.set(false);
        this.feedbackType.set('error');
        this.feedbackMessage.set('Arquivo JSON inválido.');
      }
    };

    reader.readAsText(file);
    input.value = '';
  }
}
