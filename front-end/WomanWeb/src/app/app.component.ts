import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './shared/services/auth.service';
import Chart, { registerables } from 'chart.js/auto';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'WomanWeb';
  isAdminRoute = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    // Kiểm tra route để ẩn AI assistant trong admin
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute = event.url.startsWith('/admin');
    });
  }
}
