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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/v1';
  private refreshTrigger = new Subject<void>();
  readonly refreshHabits$ = this.refreshTrigger.asObservable();

  notifyHabitChanged(): void {
    this.refreshTrigger.next();
  }

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

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
}
