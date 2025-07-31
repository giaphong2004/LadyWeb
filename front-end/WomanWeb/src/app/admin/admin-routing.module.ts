import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { ExpertsComponent } from './pages/experts/experts.component';
import { ToolsComponent } from './pages/tools/tools.component';

const routes: Routes = [
  {
    path: '', // Tất cả các đường dẫn trong admin module (vd: /admin, /admin/users)
    component: AdminLayoutComponent, // Sẽ render layout chung trước tiên
    children: [
      // Các route con sẽ được render vào trong <router-outlet> của AdminLayoutComponent
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Chuyển /admin thành /admin/dashboard
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'experts', component: ExpertsComponent },
      { path: 'tools', component: ToolsComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
