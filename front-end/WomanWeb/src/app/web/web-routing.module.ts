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
import { DetailsComponent } from './pages/details/details.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ExpertComponent } from './pages/expert/expert.component';
import { GetStartedComponent } from './pages/get-started/get-started.component';
import { GuestGuard } from '../shared/auth/guest.guard';
import { DetailsProfileComponent } from './pages/details-profile/details-profile.component';
import { ChatComponent } from './pages/chat/chat.component';

const routes: Routes = [
  // Ngoài layout
  { path: 'login', component: LoginSignupComponent },
  { path: '', component: GetStartedComponent, canActivate: [GuestGuard], pathMatch: 'full' },

  // Bên trong layout có header/footer
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'tools', component: ToolsComponent },
      { path: 'menstrual', component: MenstrualComponent },
      { path: 'ovulation', component: OvulationComponent },
      { path: 'pregnancy', component: PregnancyComponent },
      { path: 'pregnancy-test', component: PregnancyTestComponent },
      { path: 'library', component: LibraryComponent },
      { path: 'details', component: DetailsComponent },
      { path: 'posts/:slug', component: DetailsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'expert', component: ExpertComponent },
      { path: 'expert/:id', component: DetailsProfileComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'chat/:expertId', component: ChatComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebRoutingModule { }
