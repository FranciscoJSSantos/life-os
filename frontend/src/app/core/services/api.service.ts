import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/v1';

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`);
  }
}
