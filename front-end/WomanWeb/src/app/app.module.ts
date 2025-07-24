import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { ToolSectionComponent } from './components/tool-section/tool-section.component';
import { NewsSectionComponent } from './components/news-section/news-section.component';
import { TopicsSectionComponent } from './components/topics-section/topics-section.component';
import { ExpertsSectionComponent } from './components/experts-section/experts-section.component';
import { QuestionsSectionComponent } from './components/questions-section/questions-section.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthHeaderComponent } from './layout/auth-header/auth-header.component';
import { FormLoginComponent } from './components/form-login/form-login.component';
import { LoginSignupComponent } from './pages/login-signup/login-signup.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
// 1. Import các hàm cần thiết thay vì module cũ
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './interceptors/auth.interceptor';



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    HeroSectionComponent,
    ToolSectionComponent,
    NewsSectionComponent,
    TopicsSectionComponent,
    ExpertsSectionComponent,
    QuestionsSectionComponent,
    AuthHeaderComponent,
    FormLoginComponent,
    LoginSignupComponent,
    MainLayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
