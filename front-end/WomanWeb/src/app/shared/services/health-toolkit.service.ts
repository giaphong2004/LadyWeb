// services/health-toolkit.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UserHealthProfile {
  id?: number;
  user_id: number;
  goal: 'avoid_pregnancy' | 'track_health' | 'trying_to_conceive';
  avg_cycle_length: number;
  avg_period_length: number;
  cycle_length_std: number;
  avg_luteal_phase: number;
  last_period_date: string | null;
  is_pregnant: boolean;
  pregnancy_start_date: string | null;
  expected_due_date: string | null;
  track_sexual_activity: boolean;
  cycles_recorded: number;
  notify_period: boolean;
  notify_ovulation: boolean;
  notify_fertile_window: boolean;
  notify_days_before: number;
}

export interface CycleHistory {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string | null;
  period_end_date: string | null;
  cycle_length: number | null;
  period_length: number | null;
  ovulation_date: string | null;
  ovulation_confirmed: boolean;
  luteal_phase_length: number | null;
  avg_flow_intensity: number | null;
  is_complete: boolean;
  notes: string | null;
}

export interface DailyLog {
  id?: number;
  user_id?: number;
  log_date: string;
  cycle_day?: number;
  is_period_day: boolean;
  flow_intensity?: number;
  bbt?: number;
  cervical_mucus?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white';
  ovulation_test?: 'negative' | 'positive' | 'peak';
  sexual_activity: boolean;
  protection_used?: boolean;
  symptoms: string[];
  mood?: number;
  energy_level?: number;
  sleep_quality?: number;
  sleep_hours?: number;
  water_intake?: number;
  exercise_minutes?: number;
  weight?: number;
  notes?: string;
}

export interface PredictionData {
  hasData: boolean;
  isPregnant?: boolean;
  nextPeriod?: {
    predictedDate: string;
    earliestDate: string;
    latestDate: string;
    daysUntil: number;
    confidence: number;
    basedOnCycles: number;
    predictedCycleLength: number;
  };
  ovulation?: {
    ovulationDate: string;
    daysUntilOvulation: number;
    fertileWindow: {
      start: string;
      end: string;
      peakStart: string;
      peakEnd: string;
    };
    confidence: number;
    basedOnLutealPhase: number;
  };
  pregnancy?: {
    dueDate: string;
    daysUntilDue: number;
    weeksPregnant: number;
    daysExtra: number;
    pregnancyWeek: string;
    trimester: number;
  };
  cycleInfo?: {
    avgCycleLength: number;
    avgPeriodLength: number;
    cyclesRecorded: number;
    lastPeriodDate: string;
  };
}

export interface FertilityScore {
  score: number;
  rawScore?: number;
  level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'peak' | 'unknown';
  phase: string;
  cycleDay: number;
  daysToOvulation: number;
  confidence: number;
  message: string;
  goal?: string;
  date?: string;
}

export interface HealthSuggestion {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DailyRecommendation {
  type: string;
  icon: string;
  title: string;
  text: string;
  priority: string;
}

export interface DashboardData {
  hasData: boolean;
  profile?: {
    goal: string;
    isPregnant: boolean;
    avgCycleLength: number;
    avgPeriodLength: number;
    cyclesRecorded: number;
    lastPeriodDate: string;
  };
  todayLog: DailyLog | null;
  prediction?: any;
  ovulation?: any;
  fertility?: FertilityScore;
  pregnancy?: any;
  suggestions?: HealthSuggestion[];
  dailyRecommendations?: DailyRecommendation[];
  quickStats?: {
    cyclesTracked: number;
    currentCycleDay: number | null;
    todayLogged: boolean;
  };
}

export interface InsightsData {
  cycleInsights: any[];
  symptomAnalysis: {
    patterns: any[];
    insights: any[];
  };
  lifestyleCorrelations: {
    correlations: any[];
  };
  chartData: {
    chartData: any[];
    summary: any;
  };
  profile: any;
}

export interface CalendarDay {
  date: string;
  day: number;
  fertilityScore: number;
  fertilityLevel: string;
  phase: string;
  cycleDay: number;
}

@Injectable({
  providedIn: 'root'
})
export class HealthToolkitService {
  private apiUrl = 'https://ladyweb-production.up.railway.app/api/health';

  // State management
  private dashboardData$ = new BehaviorSubject<DashboardData | null>(null);
  private predictions$ = new BehaviorSubject<PredictionData | null>(null);
  private fertilityScore$ = new BehaviorSubject<FertilityScore | null>(null);

  constructor(private http: HttpClient) { }

  // ==================== PROFILE ====================

  getProfile(): Observable<{ success: boolean; data: UserHealthProfile }> {
    return this.http.get<{ success: boolean; data: UserHealthProfile }>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<UserHealthProfile>): Observable<{ success: boolean; data: UserHealthProfile }> {
    return this.http.put<{ success: boolean; data: UserHealthProfile }>(`${this.apiUrl}/profile`, data);
  }

  // ==================== CYCLE TRACKING ====================

  logPeriodStart(date: string, notes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cycle/update`, {
      action: 'period_start',
      date,
      notes
    });
  }

  logPeriodEnd(date: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cycle/update`, {
      action: 'period_end',
      date
    });
  }

  updateCycle(cycleId: number, data: { ovulation_date?: string; ovulation_confirmed?: boolean; notes?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/cycle/update`, {
      action: 'update_cycle',
      cycle_id: cycleId,
      ...data
    });
  }

  getCycleHistory(limit: number = 12): Observable<{ success: boolean; data: CycleHistory[] }> {
    return this.http.get<{ success: boolean; data: CycleHistory[] }>(
      `${this.apiUrl}/cycle/history?limit=${limit}`
    );
  }

  // ==================== PREDICTIONS ====================

  getPredictions(): Observable<{ success: boolean; data: PredictionData }> {
    return this.http.get<{ success: boolean; data: PredictionData }>(`${this.apiUrl}/prediction`).pipe(
      tap(response => this.predictions$.next(response.data))
    );
  }

  // ==================== FERTILITY ====================

  getFertilityScore(date?: string): Observable<{ success: boolean; data: FertilityScore }> {
    const url = date ? `${this.apiUrl}/fertility/score?date=${date}` : `${this.apiUrl}/fertility/score`;
    return this.http.get<{ success: boolean; data: FertilityScore }>(url).pipe(
      tap(response => this.fertilityScore$.next(response.data))
    );
  }

  getFertilityCalendar(month?: number, year?: number): Observable<{ success: boolean; data: { hasData: boolean; month: number; year: number; calendar: CalendarDay[] } }> {
    let url = `${this.apiUrl}/fertility/calendar`;
    const params = [];
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (params.length > 0) url += '?' + params.join('&');

    return this.http.get<{ success: boolean; data: { hasData: boolean; month: number; year: number; calendar: CalendarDay[] } }>(url);
  }

  // ==================== DAILY LOG ====================

  createDailyLog(log: Partial<DailyLog>): Observable<{ success: boolean; data: DailyLog }> {
    return this.http.post<{ success: boolean; data: DailyLog }>(`${this.apiUrl}/daily-log`, log);
  }

  getDailyLogs(startDate?: string, endDate?: string, limit: number = 30): Observable<{ success: boolean; data: DailyLog[] }> {
    let url = `${this.apiUrl}/daily-logs?limit=${limit}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;

    return this.http.get<{ success: boolean; data: DailyLog[] }>(url);
  }

  // ==================== SUGGESTIONS ====================

  getHealthSuggestions(date?: string): Observable<{ success: boolean; data: { suggestions: HealthSuggestion[]; dailyRecommendations: DailyRecommendation[]; currentPhase: string; cycleDay: number } }> {
    const url = date ? `${this.apiUrl}/suggestions?date=${date}` : `${this.apiUrl}/suggestions`;
    return this.http.get<{ success: boolean; data: any }>(url);
  }

  // ==================== INSIGHTS ====================

  getInsights(): Observable<{ success: boolean; data: InsightsData }> {
    return this.http.get<{ success: boolean; data: InsightsData }>(`${this.apiUrl}/insights`);
  }

  // ==================== DASHBOARD ====================

  getDashboard(): Observable<{ success: boolean; data: DashboardData }> {
    return this.http.get<{ success: boolean; data: DashboardData }>(`${this.apiUrl}/dashboard`).pipe(
      tap(response => this.dashboardData$.next(response.data))
    );
  }

  // ==================== STATE OBSERVABLES ====================

  getDashboardData$() {
    return this.dashboardData$.asObservable();
  }

  getPredictions$() {
    return this.predictions$.asObservable();
  }

  getFertilityScore$() {
    return this.fertilityScore$.asObservable();
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get fertility level color
   */
  getFertilityColor(level: string): string {
    const colors: { [key: string]: string } = {
      'very_low': '#9CA3AF',
      'low': '#60A5FA',
      'medium': '#FBBF24',
      'high': '#F97316',
      'very_high': '#EF4444',
      'peak': '#DC2626',
      'unknown': '#D1D5DB'
    };
    return colors[level] || colors['unknown'];
  }

  /**
   * Get phase display name
   */
  getPhaseDisplayName(phase: string): string {
    const names: { [key: string]: string } = {
      'menstrual': 'Kỳ kinh',
      'follicular': 'Giai đoạn nang trứng',
      'fertile_approaching': 'Sắp vào cửa sổ sinh sản',
      'peak_fertility': 'Đỉnh sinh sản',
      'ovulation': 'Rụng trứng',
      'post_ovulation': 'Sau rụng trứng',
      'luteal': 'Giai đoạn hoàng thể',
      'unknown': 'Chưa xác định'
    };
    return names[phase] || phase;
  }

  /**
   * Get symptom display name
   */
  getSymptomDisplayName(symptom: string): string {
    const names: { [key: string]: string } = {
      'cramps': 'Đau bụng kinh',
      'headache': 'Đau đầu',
      'fatigue': 'Mệt mỏi',
      'mood_swings': 'Thay đổi tâm trạng',
      'bloating': 'Đầy hơi',
      'breast_tenderness': 'Căng ngực',
      'acne': 'Mụn',
      'backache': 'Đau lưng',
      'nausea': 'Buồn nôn',
      'insomnia': 'Mất ngủ',
      'appetite_changes': 'Thay đổi khẩu vị',
      'cravings': 'Thèm ăn',
      'dizziness': 'Chóng mặt',
      'hot_flashes': 'Bốc hỏa'
    };
    return names[symptom] || symptom;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Get days until date
   */
  getDaysUntil(dateString: string): number {
    const target = new Date(dateString);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
}
