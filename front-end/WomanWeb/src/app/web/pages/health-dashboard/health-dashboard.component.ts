import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  HealthToolkitService,
  DashboardData,
  FertilityScore,
  HealthSuggestion,
  DailyRecommendation
} from '../../../shared/services/health-toolkit.service';

@Component({
  selector: 'app-health-dashboard',
  templateUrl: './health-dashboard.component.html',
  styleUrls: ['./health-dashboard.component.css'],
  standalone: false
})
export class HealthDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  dashboardData: DashboardData | null = null;
  loading = true;
  error: string | null = null;

  // Modal states
  showLogPeriodModal = false;
  showDailyLogModal = false;
  showSettingsModal = false;

  // Form data
  periodStartDate: string = '';
  selectedSymptoms: string[] = [];

  // Available symptoms
  availableSymptoms = [
    { id: 'cramps', name: 'Đau bụng kinh', icon: '🤕' },
    { id: 'headache', name: 'Đau đầu', icon: '🤯' },
    { id: 'fatigue', name: 'Mệt mỏi', icon: '😴' },
    { id: 'mood_swings', name: 'Thay đổi tâm trạng', icon: '😢' },
    { id: 'bloating', name: 'Đầy hơi', icon: '🫄' },
    { id: 'breast_tenderness', name: 'Căng ngực', icon: '💔' },
    { id: 'acne', name: 'Mụn', icon: '😣' },
    { id: 'backache', name: 'Đau lưng', icon: '🦴' },
    { id: 'nausea', name: 'Buồn nôn', icon: '🤢' },
    { id: 'insomnia', name: 'Mất ngủ', icon: '😵' },
    { id: 'cravings', name: 'Thèm ăn', icon: '🍫' }
  ];

  // Daily log form
  dailyLogForm = {
    log_date: new Date().toISOString().split('T')[0],
    is_period_day: false,
    flow_intensity: 0,
    symptoms: [] as string[],
    mood: 3,
    energy_level: 3,
    sleep_hours: 7,
    water_intake: 8,
    notes: ''
  };

  constructor(private healthService: HealthToolkitService) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    this.healthService.getDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.dashboardData = response.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Không thể tải dữ liệu. Vui lòng thử lại.';
          this.loading = false;
          console.error('Dashboard error:', err);
        }
      });
  }

  // ==================== FERTILITY SCORE ====================

  getFertilityColor(level: string): string {
    return this.healthService.getFertilityColor(level);
  }

  getPhaseDisplayName(phase: string): string {
    return this.healthService.getPhaseDisplayName(phase);
  }

  getFertilityGradient(score: number): string {
    if (score <= 20) return 'from-gray-400 to-gray-500';
    if (score <= 40) return 'from-blue-400 to-blue-500';
    if (score <= 60) return 'from-yellow-400 to-yellow-500';
    if (score <= 80) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  }

  // ==================== PERIOD LOGGING ====================

  openLogPeriodModal(): void {
    this.periodStartDate = new Date().toISOString().split('T')[0];
    this.showLogPeriodModal = true;
  }

  closeLogPeriodModal(): void {
    this.showLogPeriodModal = false;
  }

  logPeriodStart(): void {
    if (!this.periodStartDate) return;

    this.healthService.logPeriodStart(this.periodStartDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeLogPeriodModal();
          this.loadDashboard();
        },
        error: (err) => {
          console.error('Error logging period:', err);
          alert('Không thể ghi nhận. Vui lòng thử lại.');
        }
      });
  }

  logPeriodEnd(): void {
    const endDate = new Date().toISOString().split('T')[0];

    this.healthService.logPeriodEnd(endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadDashboard();
        },
        error: (err) => {
          console.error('Error logging period end:', err);
          alert('Không thể ghi nhận. Vui lòng thử lại.');
        }
      });
  }

  // ==================== DAILY LOG ====================

  openDailyLogModal(): void {
    this.dailyLogForm = {
      log_date: new Date().toISOString().split('T')[0],
      is_period_day: false,
      flow_intensity: 0,
      symptoms: [],
      mood: 3,
      energy_level: 3,
      sleep_hours: 7,
      water_intake: 8,
      notes: ''
    };
    this.showDailyLogModal = true;
  }

  closeDailyLogModal(): void {
    this.showDailyLogModal = false;
  }

  toggleSymptom(symptomId: string): void {
    const index = this.dailyLogForm.symptoms.indexOf(symptomId);
    if (index > -1) {
      this.dailyLogForm.symptoms.splice(index, 1);
    } else {
      this.dailyLogForm.symptoms.push(symptomId);
    }
  }

  isSymptomSelected(symptomId: string): boolean {
    return this.dailyLogForm.symptoms.includes(symptomId);
  }

  saveDailyLog(): void {
    this.healthService.createDailyLog(this.dailyLogForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeDailyLogModal();
          this.loadDashboard();
        },
        error: (err) => {
          console.error('Error saving daily log:', err);
          alert('Không thể lưu. Vui lòng thử lại.');
        }
      });
  }

  // ==================== HELPERS ====================

  formatDate(dateString: string): string {
    return this.healthService.formatDate(dateString);
  }

  getDaysUntilText(days: number): string {
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Ngày mai';
    if (days < 0) return `${Math.abs(days)} ngày trước`;
    return `Còn ${days} ngày`;
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'nutrition': '🥗',
      'activity': '🏃',
      'rest': '😴',
      'hydration': '💧',
      'fertility': '👶',
      'mood': '😊',
      'symptom_prep': '⚠️'
    };
    return icons[category] || '💡';
  }
}
