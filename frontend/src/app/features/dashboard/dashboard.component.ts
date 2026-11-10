import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, HealthResponse } from '../../core/services/api.service';

interface HabitItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  type: 'BOOLEAN' | 'NUMERIC' | 'DURATION';
  targetValue: number;
  currentValue: number;
  unit?: string;
  completed: boolean;
  streak: number;
}

interface TaskItem {
  id: string;
  title: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  dueTime?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  protected readonly todayFormatted = signal<string>('');
  protected readonly completionPercentage = signal<number>(0);
  protected readonly backendStatus = signal<HealthResponse | null>(null);
  protected readonly backendError = signal<boolean>(false);

  // Hábitos de demonstração interativos no estilo HabitNow
  protected readonly habits = signal<HabitItem[]>([
    {
      id: 'h1',
      name: 'Beber 2.5L de Água',
      category: 'Saúde',
      icon: 'droplet',
      color: '#06B6D4',
      type: 'NUMERIC',
      targetValue: 2500,
      currentValue: 1500,
      unit: 'ml',
      completed: false,
      streak: 7
    },
    {
      id: 'h2',
      name: 'Estudo Diário de Código',
      category: 'Estudos',
      icon: 'code',
      color: '#6366F1',
      type: 'DURATION',
      targetValue: 60,
      currentValue: 60,
      unit: 'min',
      completed: true,
      streak: 12
    },
    {
      id: 'h3',
      name: 'Treino / Exercício Físico',
      category: 'Saúde',
      icon: 'activity',
      color: '#10B981',
      type: 'BOOLEAN',
      targetValue: 1,
      currentValue: 1,
      completed: true,
      streak: 4
    },
    {
      id: 'h4',
      name: 'Leitura de Livro',
      category: 'Desenvolvimento',
      icon: 'book-open',
      color: '#A855F7',
      type: 'DURATION',
      targetValue: 30,
      currentValue: 0,
      unit: 'min',
      completed: false,
      streak: 9
    }
  ]);

  // Tarefas do dia
  protected readonly tasks = signal<TaskItem[]>([
    {
      id: 't1',
      title: 'Configurar migrações e banco de dados SQLite',
      category: 'Projeto',
      priority: 'HIGH',
      completed: true,
      dueTime: '11:00'
    },
    {
      id: 't2',
      title: 'Validar interface e componentes do LifeOS',
      category: 'Design',
      priority: 'MEDIUM',
      completed: false,
      dueTime: '15:30'
    },
    {
      id: 't3',
      title: 'Planejar módulo de recorrências personalizadas',
      category: 'Planejamento',
      priority: 'LOW',
      completed: false
    }
  ]);

  ngOnInit(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    };
    const formatted = now.toLocaleDateString('pt-BR', options);
    this.todayFormatted.set(formatted.charAt(0).toUpperCase() + formatted.slice(1));

    this.calculateCompletion();
    this.checkBackend();
  }

  toggleHabit(habitId: string): void {
    this.habits.update(items =>
      items.map(h => {
        if (h.id === habitId) {
          const newCompleted = !h.completed;
          return {
            ...h,
            completed: newCompleted,
            currentValue: newCompleted ? h.targetValue : 0,
            streak: newCompleted ? h.streak + 1 : Math.max(0, h.streak - 1)
          };
        }
        return h;
      })
    );
    this.calculateCompletion();
  }

  toggleTask(taskId: string): void {
    this.tasks.update(items =>
      items.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    this.calculateCompletion();
  }

  private calculateCompletion(): void {
    const habits = this.habits();
    const tasks = this.tasks();
    const total = habits.length + tasks.length;
    if (total === 0) {
      this.completionPercentage.set(0);
      return;
    }
    const completed = habits.filter(h => h.completed).length + tasks.filter(t => t.completed).length;
    this.completionPercentage.set(Math.round((completed / total) * 100));
  }

  private checkBackend(): void {
    this.apiService.getHealth().subscribe({
      next: (res) => {
        this.backendStatus.set(res);
        this.backendError.set(false);
      },
      error: () => {
        this.backendError.set(true);
      }
    });
  }
}
