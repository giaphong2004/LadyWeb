import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginSignupComponent } from './pages/login-signup/login-signup.component';
import { ToolsComponent } from './pages/tools/tools.component';
import { MenstrualComponent } from './pages/menstrual/menstrual.component';
import { OvulationComponent } from './pages/ovulation/ovulation.component';
import { PregnancyComponent } from './pages/pregnancy/pregnancy.component';
import { PregnancyTestComponent } from './pages/pregnancy-test/pregnancy-test.component';
import { LibraryComponent } from './pages/library/library.component';

const routes: Routes = [{
  path: 'login', component: LoginSignupComponent
},
{
  path: 'tools', component: ToolsComponent
},
{
  path: 'menstrual', component: MenstrualComponent
},
{
  path: 'ovulation', component: OvulationComponent
},
{
  path: 'pregnancy', component: PregnancyComponent
},
{
  path: 'pregnancy-test', component: PregnancyTestComponent
},
{
  path: 'library', component: LibraryComponent
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
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebRoutingModule { }
