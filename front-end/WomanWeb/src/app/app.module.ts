import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { withInterceptorsFromDi, withFetch } from '@angular/common/http';
import { WebModule } from './web/web.module';
import { BrowserModule } from '@angular/platform-browser';
import { AiAssistantComponent } from './web/components/ai-assistant/ai-assistant.component';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    WebModule,
    AiAssistantComponent,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
