import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface HealthResponse {
  status: string;
  app: string;
  timestamp: string;
  database: {
    status: string;
    counts: {
      categories: number;
      habits: number;
      tasks: number;
    };
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
}

export interface HabitTodayItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  category_id?: string;
  icon: string;
  color: string;
  habit_type: 'BOOLEAN' | 'NUMERIC' | 'DURATION';
  target_value: number;
  current_value: number;
  unit?: string;
  completed: boolean;
  streak: number;
  logs_count: number;
}

export interface CreateHabitDto {
  name: string;
  description?: string;
  category_id?: string;
  icon?: string;
  color?: string;
  habit_type: 'BOOLEAN' | 'NUMERIC' | 'DURATION';
  target_value: number;
  unit?: string;
  schedule?: {
    frequency_type: 'DAILY' | 'WEEKLY_DAYS' | 'INTERVAL' | 'MONTHLY_DAYS';
    weekdays?: string;
    interval_value?: number;
  };
}

export interface TaskTodayItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  category_id?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completed: boolean;
  due_date?: string;
  due_time?: string;
  subtasks_count: number;
  subtasks_completed: number;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  category_id?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date?: string;
  subtasks?: { title: string; completed: boolean }[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/v1';
  
  private refreshTrigger = new Subject<void>();
  readonly refreshData$ = this.refreshTrigger.asObservable();
  readonly refreshHabits$ = this.refreshData$; // backward compat

  notifyDataChanged(): void {
    this.refreshTrigger.next();
  }

  notifyHabitChanged(): void {
    this.notifyDataChanged();
  }

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  // Habits
  getTodayHabits(targetDate?: string): Observable<HabitTodayItem[]> {
    let params = new HttpParams();
    if (targetDate) {
      params = params.set('target_date', targetDate);
    }
    return this.http.get<HabitTodayItem[]>(`${this.baseUrl}/habits/today`, { params });
  }

  toggleHabit(habitId: string, targetDate?: string, value?: number): Observable<HabitTodayItem> {
    let params = new HttpParams();
    if (targetDate) {
      params = params.set('target_date', targetDate);
    }
    if (value !== undefined) {
      params = params.set('value', value.toString());
    }
    return this.http.post<HabitTodayItem>(`${this.baseUrl}/habits/${habitId}/toggle`, {}, { params });
  }

  createHabit(payload: CreateHabitDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/habits`, payload);
  }

  listAllHabits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/habits`);
  }

  // Tasks
  getTodayTasks(targetDate?: string): Observable<TaskTodayItem[]> {
    let params = new HttpParams();
    if (targetDate) {
      params = params.set('target_date', targetDate);
    }
    return this.http.get<TaskTodayItem[]>(`${this.baseUrl}/tasks/today`, { params });
  }

  toggleTask(taskId: string): Observable<TaskTodayItem> {
    return this.http.post<TaskTodayItem>(`${this.baseUrl}/tasks/${taskId}/toggle`, {});
  }

  createTask(payload: CreateTaskDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tasks`, payload);
  }

  listAllTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tasks`);
  }
}
