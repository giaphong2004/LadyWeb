import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginSignupComponent } from './pages/login-signup/login-signup.component';
import { ToolsComponent } from './pages/tools/tools.component';
import { MenstrualComponent } from './pages/menstrual/menstrual.component';


const routes: Routes = [
  {
    path: 'login', component: LoginSignupComponent
  },
  {
    path: 'tools', component: ToolsComponent
  },
  {
    path: 'menstrual', component: MenstrualComponent
  },
  {
    path: '',
    component: MainLayoutComponent, // Layout này có header và footer
    children: [
      { path: '', component: HomeComponent }, // Trang chủ
      // { path: 'about', component: AboutComponent }, // Các trang khác cũng đặt vào đây
      // { path: 'contact', component: ContactComponent },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
