import { Component } from '@angular/core';
import { DashboardService } from '../../../shared/services/dashboard.service';


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  // Biến lưu các số liệu thống kê tổng hợp
  stats: any = {};

  // Biến cho dữ liệu biểu đồ
  chartLabels: string[] = [];
  chartData: any[] = [{
    data: [],
    label: 'Người dùng mới',
    borderColor: '#3e95cd',
    backgroundColor: 'rgba(62, 149, 205, 0.2)',
    fill: true,
    tension: 0.3
  }];

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;

        // Xử lý dữ liệu cho biểu đồ
        if (data.dailyRegistrations) {
          this.chartLabels = data.dailyRegistrations.map((item: any) =>
            new Date(item.date).toLocaleDateString('vi-VN') // Định dạng ngày tháng cho đẹp
          );
          this.chartData[0].data = data.dailyRegistrations.map((item: any) => item.count);
        }
      },
      error: (err) => {
        console.error("Failed to load dashboard stats", err);
      }
    });
  }
}

