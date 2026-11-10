import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CreateHabitModalComponent } from './shared/components/create-habit-modal/create-habit-modal.component';
import { ApiService } from './core/services/api.service';

interface NavItem {
  label: string;
  route: string;
  iconSvg: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, CreateHabitModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private apiService = inject(ApiService);

  protected readonly isModalOpen = signal<boolean>(false);

  protected readonly navItems: NavItem[] = [
    { label: 'Hoje', route: '', iconSvg: 'sun' },
    { label: 'Hábitos', route: '/habits', iconSvg: 'check-circle' },
    { label: 'Tarefas', route: '/tasks', iconSvg: 'check-square' },
    { label: 'Rotinas', route: '/routines', iconSvg: 'clock' },
    { label: 'Calendário', route: '/calendar', iconSvg: 'calendar' },
    { label: 'Metas', route: '/goals', iconSvg: 'target' },
    { label: 'Estatísticas', route: '/analytics', iconSvg: 'bar-chart' },
    { label: 'Configurações', route: '/settings', iconSvg: 'settings' }
  ];

  openQuickAdd(): void {
    this.isModalOpen.set(true);
  }

  closeQuickAdd(): void {
    this.isModalOpen.set(false);
  }

  onHabitCreated(): void {
    this.apiService.notifyHabitChanged();
  }
}
