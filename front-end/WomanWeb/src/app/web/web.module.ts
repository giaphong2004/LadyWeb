import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebRoutingModule } from './web-routing.module';

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

import { FormLoginComponent } from './components/form-login/form-login.component';
import { LoginSignupComponent } from './pages/login-signup/login-signup.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
// 1. Import các hàm cần thiết thay vì module cũ

import { ReactiveFormsModule } from '@angular/forms';
import { ToolTitleComponent } from './components/tool-title/tool-title.component';
import { ToolCardComponent } from './components/tool-card/tool-card.component';
import { ToolsComponent } from './pages/tools/tools.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { MenstrualHeroSectionComponent } from './components/menstrual-hero-section/menstrual-hero-section.component';
import { MenstrualCaculatorComponent } from './components/menstrual-caculator/menstrual-caculator.component';
import { MenstrualDescribeComponent } from './components/menstrual-describe/menstrual-describe.component';
import { MenstrualComponent } from './pages/menstrual/menstrual.component';
import { OvulationBreadcrumbsComponent } from './components/ovulation-breadcrumbs/ovulation-breadcrumbs.component';
import { OvulationHeroSectionComponent } from './components/ovulation-hero-section/ovulation-hero-section.component';
import { OvulationCaculatorComponent } from './components/ovulation-caculator/ovulation-caculator.component';
import { OvulationDescribeComponent } from './components/ovulation-describe/ovulation-describe.component';
import { OvulationComponent } from './pages/ovulation/ovulation.component';
import { PregnancyBreadcrumbsComponent } from './components/pregnancy-breadcrumbs/pregnancy-breadcrumbs.component';
import { PregnancyCaculatorComponent } from './components/pregnancy-caculator/pregnancy-caculator.component';
import { PregnancyDescribeComponent } from './components/pregnancy-describe/pregnancy-describe.component';
import { PregnancyHeroSectionComponent } from './components/pregnancy-hero-section/pregnancy-hero-section.component';
import { PregnancyComponent } from './pages/pregnancy/pregnancy.component';
import { PregnancyTestBreadcrumbsComponent } from './components/pregnancy-test-breadcrumbs/pregnancy-test-breadcrumbs.component';
import { PregnancyTestHeroSectionComponent } from './components/pregnancy-test-hero-section/pregnancy-test-hero-section.component';
import { PregnancyTestCaculatorComponent } from './components/pregnancy-test-caculator/pregnancy-test-caculator.component';
import { PregnancyTestDescribeComponent } from './components/pregnancy-test-describe/pregnancy-test-describe.component';
import { PregnancyTestComponent } from './pages/pregnancy-test/pregnancy-test.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    HeroSectionComponent,
    ToolSectionComponent,
    NewsSectionComponent,
    TopicsSectionComponent,
    ExpertsSectionComponent,
    QuestionsSectionComponent,
    FormLoginComponent,
    LoginSignupComponent,
    MainLayoutComponent,
    ToolTitleComponent,
    ToolCardComponent,
    ToolsComponent,
    BreadcrumbsComponent,
    MenstrualHeroSectionComponent,
    MenstrualCaculatorComponent,
    MenstrualDescribeComponent,
    MenstrualComponent,
    OvulationBreadcrumbsComponent,
    OvulationHeroSectionComponent,
    OvulationCaculatorComponent,
    OvulationDescribeComponent,
    OvulationComponent,
    PregnancyBreadcrumbsComponent,
    PregnancyCaculatorComponent,
    PregnancyDescribeComponent,
    PregnancyHeroSectionComponent,
    PregnancyComponent,
    PregnancyTestBreadcrumbsComponent,
    PregnancyTestHeroSectionComponent,
    PregnancyTestCaculatorComponent,
    PregnancyTestDescribeComponent,
    PregnancyTestComponent,],
  imports: [
    CommonModule,
    WebRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ]

})
export class WebModule { }
