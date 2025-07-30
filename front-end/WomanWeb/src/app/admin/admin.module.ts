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
import { UsersHeaderComponent } from './components/users-header/users-header.component';
import { UsersControlsComponent } from './components/users-controls/users-controls.component';
import { UsersTableComponent } from './components/users-table/users-table.component';
import { UsersComponent } from './pages/users/users.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';



@NgModule({
  declarations: [
    DashboardHeaderComponent,
    DashboardStatsGridComponent,
    DashboardChartComponent,
    DashboardActionsComponent,
    DashboardComponent,
    SidebarComponent,
    AdminHeaderComponent,
    UsersHeaderComponent,
    UsersControlsComponent,
    UsersTableComponent,
    UsersComponent,
    AdminLayoutComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
