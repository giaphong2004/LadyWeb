import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard-chart',
  standalone: false,
  templateUrl: './dashboard-chart.component.html',
  styleUrl: './dashboard-chart.component.css'
})
export class DashboardChartComponent {
  @Input() labels: string[] = [];
  @Input() datasets: any[] = [];

  // Cấu hình cho biểu đồ
  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1 // Chỉ hiển thị các số nguyên trên trục Y
        }
      }
    }
  };

  public chartType: ChartType = 'line';
}

