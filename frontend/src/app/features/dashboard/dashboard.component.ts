import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiService, HealthResponse, HabitTodayItem } from '../../core/services/api.service';

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
export class DashboardComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private sub = new Subscription();

  protected readonly todayFormatted = signal<string>('');
  protected readonly completionPercentage = signal<number>(0);
  protected readonly backendStatus = signal<HealthResponse | null>(null);
  protected readonly backendError = signal<boolean>(false);
  protected readonly isLoading = signal<boolean>(true);

  // Hábitos reais vindos do backend SQLite
  protected readonly habits = signal<HabitTodayItem[]>([]);

  // Tarefas locais (Sprint 3 integrará persistência de tarefas)
  protected readonly tasks = signal<TaskItem[]>([
    {
      id: 't1',
      title: 'Estruturação do Backend e Frontend',
      category: 'Projeto',
      priority: 'HIGH',
      completed: true,
      dueTime: '11:00'
    },
    {
      id: 't2',
      title: 'Validar persistência de hábitos no SQLite',
      category: 'Design',
      priority: 'MEDIUM',
      completed: true,
      dueTime: '15:30'
    },
    {
      id: 't3',
      title: 'Planejar módulo de rotinas e calendário',
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

    this.loadData();

    // Escutar eventos de criação/atualização de hábitos
    this.sub.add(
      this.apiService.refreshHabits$.subscribe(() => {
        this.loadHabits();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.checkBackend();
    this.loadHabits();
  }

  loadHabits(): void {
    this.apiService.getTodayHabits().subscribe({
      next: (items) => {
        this.habits.set(items);
        this.calculateCompletion();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  toggleHabit(habitId: string): void {
    // Atualização otimista na UI
    this.habits.update(items =>
      items.map(h => {
        if (h.id === habitId) {
          const newCompleted = !h.completed;
          return {
            ...h,
            completed: newCompleted,
            current_value: newCompleted ? h.target_value : 0,
            streak: newCompleted ? h.streak + 1 : Math.max(0, h.streak - 1)
          };
        }
        return h;
      })
    );
    this.calculateCompletion();

    // Persistir no backend SQLite
    this.apiService.toggleHabit(habitId).subscribe({
      next: (updatedItem) => {
        this.habits.update(items =>
          items.map(h => (h.id === habitId ? updatedItem : h))
        );
        this.calculateCompletion();
      },
      error: (err) => {
        console.error('Erro ao alternar hábito:', err);
        // Recarregar estado real do banco em caso de erro
        this.loadHabits();
      }
    });
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
