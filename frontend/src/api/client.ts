const BASE_URL = 'http://127.0.0.1:8000/api/v1';

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
      routines: number;
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

export interface HabitPeriodStatus {
  period: string;
  completed: boolean;
  notes?: string;
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
  periods?: string[];
  period_statuses?: HabitPeriodStatus[];
  completed: boolean;
  is_partial?: boolean;
  completion_rate?: number;
  streak: number;
  logs_count: number;
  notes?: string;
}

export interface CreateHabitDto {
  name: string;
  description?: string;
  category_id?: string;
  icon?: string;
  color?: string;
  habit_type: 'BOOLEAN' | 'NUMERIC' | 'DURATION';
  target_value: number;
  unit?: string | null;
  periods?: string | null;
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

export interface RoutineItem {
  id: string;
  routine_id: string;
  title: string;
  start_time?: string;
  duration_minutes?: number;
  position: number;
  linked_habit_id?: string;
  linked_task_id?: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  days_of_week?: string;
  items: RoutineItem[];
}

export interface CalendarDayData {
  date: string;
  weekday: number;
  habits_total: number;
  habits_completed: number;
  tasks_total: number;
  tasks_completed: number;
  completion_rate: number;
}

export interface CalendarMonthRead {
  year: number;
  month: number;
  days: CalendarDayData[];
}

export interface HeatmapDay {
  date: string;
  value: number;
  target_value: number;
  completed: boolean;
  intensity: number;
}

export interface AnalyticsOverview {
  total_habits: number;
  active_habits: number;
  total_tasks: number;
  completed_tasks: number;
  best_streak_habit: string | null;
  best_streak_count: number;
  weekly_completion_rate: number;
  monthly_completion_rate: number;
  total_completed_logs: number;
}

export interface ChallengeHabitStat {
  habit_id: string;
  name: string;
  color: string;
  icon: string;
  completed_count: number;
  expected_count: number;
  accuracy_rate: number;
}

export interface ChallengeTimelineNote {
  date: string;
  habit_name: string;
  note: string;
}

export interface ChallengeRead {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  days_elapsed: number;
  days_remaining: number;
  target_accuracy: number;
  accuracy_rate: number;
  days_perfect: number;
  is_on_track: boolean;
  color: string;
  icon: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'ARCHIVED';
  habits_stats: ChallengeHabitStat[];
}

export interface ChallengeCreateDto {
  name: string;
  description?: string;
  start_date: string;
  duration_days: number;
  target_accuracy: number;
  color?: string;
  icon?: string;
  habit_ids: string[];
}

export interface AISummaryRequest {
  api_key?: string;
  provider?: string;
  custom_prompt?: string;
}

export interface ChallengeSummaryReport {
  challenge_id: string;
  name: string;
  start_date: string;
  end_date: string;
  days_elapsed: number;
  total_days: number;
  overall_accuracy: number;
  is_on_track: boolean;
  habits_stats: ChallengeHabitStat[];
  timeline_notes: ChallengeTimelineNote[];
  ai_analysis: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }
  if (res.status === 204) {
    return {} as T;
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export const api = {
  getHealth: () => request<HealthResponse>('/health'),
  getCategories: () => request<Category[]>('/categories'),
  getTodayHabits: (date?: string) => request<HabitTodayItem[]>(`/habits/today${date ? `?target_date=${date}` : ''}`),
  toggleHabit: (habitId: string, date?: string, value?: number, notes?: string, period?: string) => {
    const params = new URLSearchParams();
    if (date) params.append('target_date', date);
    if (value !== undefined) params.append('value', value.toString());
    if (notes !== undefined) params.append('notes', notes);
    if (period) params.append('period', period);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<HabitTodayItem>(`/habits/${habitId}/toggle${query}`, { method: 'POST' });
  },
  createHabit: (payload: CreateHabitDto) => request('/habits', { method: 'POST', body: JSON.stringify(payload) }),
  updateHabit: (habitId: string, payload: Partial<CreateHabitDto>) => request<any>(`/habits/${habitId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteHabit: (habitId: string, hardDelete: boolean = true) => request<any>(`/habits/${habitId}?hard_delete=${hardDelete}`, { method: 'DELETE' }),
  listAllHabits: () => request<any[]>('/habits'),
  getTodayTasks: (date?: string) => request<TaskTodayItem[]>(`/tasks/today${date ? `?target_date=${date}` : ''}`),
  toggleTask: (taskId: string) => request<TaskTodayItem>(`/tasks/${taskId}/toggle`, { method: 'POST' }),
  createTask: (payload: CreateTaskDto) => request('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  getRoutines: () => request<Routine[]>('/routines'),
  getCalendar: (year: number, month: number) => request<CalendarMonthRead>(`/calendar?year=${year}&month=${month}`),
  getAnalyticsOverview: () => request<AnalyticsOverview>('/analytics/overview'),
  getHabitHeatmap: (habitId: string, year?: number) => request<HeatmapDay[]>(`/analytics/heatmap/${habitId}${year ? `?year=${year}` : ''}`),
  getChallenges: () => request<ChallengeRead[]>('/challenges'),
  createChallenge: (payload: ChallengeCreateDto) => request<ChallengeRead>('/challenges', { method: 'POST', body: JSON.stringify(payload) }),
  updateChallenge: (challengeId: string, payload: Partial<ChallengeCreateDto>) => request<ChallengeRead>(`/challenges/${challengeId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteChallenge: (challengeId: string) => request<void>(`/challenges/${challengeId}`, { method: 'DELETE' }),
  getChallengeSummary: (challengeId: string, payload?: AISummaryRequest) => request<ChallengeSummaryReport>(`/challenges/${challengeId}/summary`, { method: 'POST', body: JSON.stringify(payload || {}) }),
  exportBackup: () => request<any>('/backup/export'),
  importBackup: (payload: any) => request<any>('/backup/import', { method: 'POST', body: JSON.stringify(payload) })
};
