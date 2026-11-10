import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiService, HealthResponse, HabitTodayItem, TaskTodayItem } from '../../core/services/api.service';

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

  // Hábitos reais vindos do SQLite
  protected readonly habits = signal<HabitTodayItem[]>([]);

  // Tarefas reais vindas do SQLite
  protected readonly tasks = signal<TaskTodayItem[]>([]);

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

    // Escutar eventos de criação/atualização
    this.sub.add(
      this.apiService.refreshData$.subscribe(() => {
        this.loadHabits();
        this.loadTasks();
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
    this.loadTasks();
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

  loadTasks(): void {
    this.apiService.getTodayTasks().subscribe({
      next: (items) => {
        this.tasks.set(items);
        this.calculateCompletion();
      },
      error: (err) => {
        console.error('Erro ao carregar tarefas:', err);
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
        this.loadHabits();
      }
    });
  }

  toggleTask(taskId: string): void {
    // Atualização otimista
    this.tasks.update(items =>
      items.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    this.calculateCompletion();

    // Persistir no backend SQLite
    this.apiService.toggleTask(taskId).subscribe({
      next: (updatedItem) => {
        this.tasks.update(items =>
          items.map(t => (t.id === taskId ? updatedItem : t))
        );
        this.calculateCompletion();
      },
      error: (err) => {
        console.error('Erro ao alternar tarefa:', err);
        this.loadTasks();
      }
    });
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
