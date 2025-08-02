import { Component } from '@angular/core';
import { AuthService } from './shared/services/auth.service';
import Chart, { registerables } from 'chart.js/auto';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'WomanWeb';
  constructor(public authService: AuthService) {
    Chart.register(...registerables);
  }
}
