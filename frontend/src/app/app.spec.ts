import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { ApiService } from './core/services/api.service';

describe('App', () => {
  const mockApiService = {
    getCategories: () => of([]),
    getHealth: () => of({ status: 'healthy', app: 'LifeOS', timestamp: '', database: { status: 'connected', counts: { categories: 0, habits: 0, tasks: 0 } } }),
    getTodayHabits: () => of([]),
    refreshHabits$: of(),
    notifyHabitChanged: () => {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: mockApiService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render brand name LifeOS', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-name')?.textContent).toContain('LifeOS');
  });
});
