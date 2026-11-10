import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, CalendarMonthRead, CalendarDayData } from '../../core/services/api.service';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {
  private apiService = inject(ApiService);

  protected currentYear = signal<number>(new Date().getFullYear());
  protected currentMonth = signal<number>(new Date().getMonth() + 1);
  protected readonly monthData = signal<CalendarMonthRead | null>(null);
  protected readonly selectedDay = signal<CalendarDayData | null>(null);
  protected readonly isLoading = signal<boolean>(true);

  protected readonly weekHeader = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  ngOnInit(): void {
    this.loadCalendar();
  }

  loadCalendar(): void {
    this.isLoading.set(true);
    this.apiService.getCalendar(this.currentYear(), this.currentMonth()).subscribe({
      next: (data) => {
        this.monthData.set(data);
        this.isLoading.set(false);
        // Selecionar o dia de hoje se estiver no mês atual
        const todayStr = new Date().toISOString().split('T')[0];
        const todayFound = data.days.find(d => d.date === todayStr);
        if (todayFound) {
          this.selectedDay.set(todayFound);
        } else if (data.days.length > 0) {
          this.selectedDay.set(data.days[0]);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  previousMonth(): void {
    if (this.currentMonth() === 1) {
      this.currentMonth.set(12);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
    this.loadCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth() === 12) {
      this.currentMonth.set(1);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
    this.loadCalendar();
  }

  getMonthName(): string {
    const d = new Date(this.currentYear(), this.currentMonth() - 1, 1);
    const name = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  selectDay(day: CalendarDayData): void {
    this.selectedDay.set(day);
  }

  getDayNumber(dateStr: string): number {
    return parseInt(dateStr.split('-')[2], 10);
  }
}
