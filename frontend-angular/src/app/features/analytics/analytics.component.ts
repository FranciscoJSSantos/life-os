import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, AnalyticsOverview, HeatmapDay } from '../../core/services/api.service';

interface HabitSummary {
  id: string;
  name: string;
  color: string;
  streak: number;
  heatmap: HeatmapDay[];
}

@Component({
  selector: 'app-analytics-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  private apiService = inject(ApiService);

  protected readonly overview = signal<AnalyticsOverview | null>(null);
  protected readonly habitsHeatmaps = signal<HabitSummary[]>([]);
  protected readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.apiService.getAnalyticsOverview().subscribe({
      next: (data) => {
        this.overview.set(data);
      }
    });

    this.apiService.listAllHabits().subscribe({
      next: (habits) => {
        if (habits.length === 0) {
          this.isLoading.set(false);
          return;
        }

        const summaries: HabitSummary[] = [];
        let loaded = 0;

        for (const h of habits) {
          this.apiService.getHabitHeatmap(h.id).subscribe({
            next: (heatmapDays) => {
              // Pegar os últimos 90 dias para visualização limpa
              const recentDays = heatmapDays.slice(-90);
              summaries.push({
                id: h.id,
                name: h.name,
                color: h.color || '#10B981',
                streak: 0,
                heatmap: recentDays
              });

              loaded++;
              if (loaded === habits.length) {
                this.habitsHeatmaps.set(summaries);
                this.isLoading.set(false);
              }
            },
            error: () => {
              loaded++;
              if (loaded === habits.length) {
                this.habitsHeatmaps.set(summaries);
                this.isLoading.set(false);
              }
            }
          });
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
