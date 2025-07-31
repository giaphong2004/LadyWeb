import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './shared/auth/admin.guard';

const routes: Routes = [
  {
    path: '', // Tất cả các đường dẫn không khớp với 'admin' sẽ đi vào đây
    loadChildren: () => import('./web/web.module').then(m => m.WebModule)
    // Giả định module của bạn là WebModule và nằm trong 'src/app/web/web.module.ts'
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
