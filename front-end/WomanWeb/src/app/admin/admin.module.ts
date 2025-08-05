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
import { ExpertsHeaderComponent } from './components/experts-header/experts-header.component';
import { ExpertsGridComponent } from './components/experts-grid/experts-grid.component';
import { ExpertsComponent } from './pages/experts/experts.component';
import { ToolsComponent } from './pages/tools/tools.component';
import { ToolsHeaderComponent } from './components/tools-header/tools-header.component';
import { ToolsMenstrualCardComponent } from './components/tools-menstrual-card/tools-menstrual-card.component';
import { ToolsOvulationCardComponent } from './components/tools-ovulation-card/tools-ovulation-card.component';
import { ToolsPregnancyCardComponent } from './components/tools-pregnancy-card/tools-pregnancy-card.component';
import { ToolsPregnancyTestCardComponent } from './components/tools-pregnancy-test-card/tools-pregnancy-test-card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { LibraryHeaderComponent } from './components/library-header/library-header.component';
import { LibraryControlsComponent } from './components/library-controls/library-controls.component';
import { LibraryTableComponent } from './components/library-table/library-table.component';
import { LibraryComponent } from './pages/library/library.component';
import { LibraryEditComponent } from './components/library-edit/library-edit.component';
import { EditorModule } from '@tinymce/tinymce-angular';

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
    AdminLayoutComponent,
    ExpertsHeaderComponent,
    ExpertsGridComponent,
    ExpertsComponent,
    ToolsComponent,
    ToolsHeaderComponent,
    ToolsMenstrualCardComponent,
    ToolsOvulationCardComponent,
    ToolsPregnancyCardComponent,
    ToolsPregnancyTestCardComponent,
    LibraryHeaderComponent,
    LibraryControlsComponent,
    LibraryTableComponent,
    LibraryComponent,
    LibraryEditComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    BaseChartDirective,
    EditorModule
  ]
})
export class AdminModule { }
