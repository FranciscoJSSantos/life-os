import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  route: string;
  iconSvg: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly activeTab = signal<string>('dashboard');

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
    // Ação do botão rápido (+)
    console.log('Abrir modal de criação rápida (Hábito / Tarefa / Meta)');
  }
}
