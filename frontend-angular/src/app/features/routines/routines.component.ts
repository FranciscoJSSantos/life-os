import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Routine } from '../../core/services/api.service';

@Component({
  selector: 'app-routines',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './routines.component.html',
  styleUrl: './routines.component.scss'
})
export class RoutinesComponent implements OnInit {
  private apiService = inject(ApiService);

  protected readonly routines = signal<Routine[]>([]);
  protected readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadRoutines();
  }

  loadRoutines(): void {
    this.isLoading.set(true);
    this.apiService.getRoutines().subscribe({
      next: (data) => {
        this.routines.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
