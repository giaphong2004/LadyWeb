import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, User } from '../../services/auth.service'; // Import AuthService và User

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  isLoggedIn$: Observable<boolean>;
  currentUser$: Observable<User | null>; // 👈 Thêm observable cho user

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.currentUser$ = this.authService.currentUser$; // 👈 Lấy observable user
  }
  onLogout(): void {
    this.authService.logout();
  }
}
