import { Component } from '@angular/core';
import { Input } from '@angular/core';
@Component({
  selector: 'app-dashboard-stats-grid',
  standalone: false,
  templateUrl: './dashboard-stats-grid.component.html',
  styleUrl: './dashboard-stats-grid.component.css'
})
export class DashboardStatsGridComponent {
  @Input() stats: any = {};
}
