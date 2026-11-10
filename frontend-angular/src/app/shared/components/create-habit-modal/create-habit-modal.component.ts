import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Category, CreateHabitDto, CreateTaskDto } from '../../../core/services/api.service';

@Component({
  selector: 'app-create-habit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-habit-modal.component.html',
  styleUrl: './create-habit-modal.component.scss'
})
export class CreateHabitModalComponent implements OnInit {
  private apiService = inject(ApiService);

  @Input({ required: true }) isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() habitCreated = new EventEmitter<void>();

  protected readonly categories = signal<Category[]>([]);
  protected readonly isSaving = signal<boolean>(false);
  protected activeTab: 'HABIT' | 'TASK' = 'HABIT';

  // Habit Form Model
  protected name = '';
  protected description = '';
  protected selectedCategoryId = '';
  protected habitType: 'BOOLEAN' | 'NUMERIC' | 'DURATION' = 'BOOLEAN';
  protected targetValue = 1;
  protected unit = '';
  protected selectedColor = '#10B981';
  protected frequencyType: 'DAILY' | 'WEEKLY_DAYS' = 'DAILY';

  // Task Form Model
  protected taskTitle = '';
  protected taskDescription = '';
  protected taskCategoryId = '';
  protected taskPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
  protected taskDueDate = new Date().toISOString().split('T')[0];
  protected taskSubtasks: { title: string }[] = [];
  protected newSubtaskTitle = '';

  // Weekday selector (0=Segunda, 6=Domingo)
  protected selectedDays = [
    { label: 'S', day: 0, selected: true },
    { label: 'T', day: 1, selected: true },
    { label: 'Q', day: 2, selected: true },
    { label: 'Q', day: 3, selected: true },
    { label: 'S', day: 4, selected: true },
    { label: 'S', day: 5, selected: true },
    { label: 'D', day: 6, selected: true }
  ];

  protected colors = [
    '#10B981', '#06B6D4', '#6366F1', '#A855F7',
    '#EC4899', '#EF4444', '#F59E0B', '#3B82F6'
  ];

  ngOnInit(): void {
    this.apiService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        if (cats.length > 0) {
          this.selectedCategoryId = cats[0].id;
          this.taskCategoryId = cats[0].id;
        }
      }
    });
  }

  toggleDay(dayIndex: number): void {
    this.selectedDays[dayIndex].selected = !this.selectedDays[dayIndex].selected;
  }

  addSubtask(): void {
    if (this.newSubtaskTitle.trim()) {
      this.taskSubtasks.push({ title: this.newSubtaskTitle.trim() });
      this.newSubtaskTitle = '';
    }
  }

  removeSubtask(index: number): void {
    this.taskSubtasks.splice(index, 1);
  }

  save(): void {
    if (this.activeTab === 'HABIT') {
      this.saveHabit();
    } else {
      this.saveTask();
    }
  }

  private saveHabit(): void {
    if (!this.name.trim()) return;

    this.isSaving.set(true);

    const weekdaysStr = this.selectedDays
      .filter(d => d.selected)
      .map(d => d.day)
      .join(',');

    const payload: CreateHabitDto = {
      name: this.name.trim(),
      description: this.description.trim() || undefined,
      category_id: this.selectedCategoryId || undefined,
      color: this.selectedColor,
      habit_type: this.habitType,
      target_value: this.habitType === 'BOOLEAN' ? 1.0 : this.targetValue,
      unit: this.habitType === 'BOOLEAN' ? undefined : (this.unit.trim() || (this.habitType === 'DURATION' ? 'min' : 'vezes')),
      schedule: {
        frequency_type: this.frequencyType,
        weekdays: this.frequencyType === 'WEEKLY_DAYS' ? weekdaysStr : undefined
      }
    };

    this.apiService.createHabit(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.resetHabitForm();
        this.habitCreated.emit();
        this.close.emit();
      },
      error: (err) => {
        console.error('Erro ao salvar hábito:', err);
        this.isSaving.set(false);
      }
    });
  }

  private saveTask(): void {
    if (!this.taskTitle.trim()) return;

    this.isSaving.set(true);

    const payload: CreateTaskDto = {
      title: this.taskTitle.trim(),
      description: this.taskDescription.trim() || undefined,
      category_id: this.taskCategoryId || undefined,
      priority: this.taskPriority,
      due_date: this.taskDueDate || undefined,
      subtasks: this.taskSubtasks.map(s => ({ title: s.title, completed: false }))
    };

    this.apiService.createTask(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.resetTaskForm();
        this.habitCreated.emit();
        this.close.emit();
      },
      error: (err) => {
        console.error('Erro ao salvar tarefa:', err);
        this.isSaving.set(false);
      }
    });
  }

  private resetHabitForm(): void {
    this.name = '';
    this.description = '';
    this.habitType = 'BOOLEAN';
    this.targetValue = 1;
    this.unit = '';
    this.selectedColor = '#10B981';
    this.frequencyType = 'DAILY';
  }

  private resetTaskForm(): void {
    this.taskTitle = '';
    this.taskDescription = '';
    this.taskPriority = 'MEDIUM';
    this.taskSubtasks = [];
    this.newSubtaskTitle = '';
  }
}
