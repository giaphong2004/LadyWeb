import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { DashboardStatsGridComponent } from './components/dashboard-stats-grid/dashboard-stats-grid.component';
import { DashboardChartComponent } from './components/dashboard-chart/dashboard-chart.component';
import { DashboardActionsComponent } from './components/dashboard-actions/dashboard-actions.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { AdminHeaderComponent } from './layout/admin-header/admin-header.component';



@NgModule({
  declarations: [
    DashboardHeaderComponent,
    DashboardStatsGridComponent,
    DashboardChartComponent,
    DashboardActionsComponent,
    DashboardComponent,
    SidebarComponent,
    AdminHeaderComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
