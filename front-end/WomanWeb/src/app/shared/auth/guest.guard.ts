import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  canActivate(): boolean {
    // Chỉ kiểm tra trên browser
    if (isPlatformBrowser(this.platformId)) {
      // Nếu đã đăng nhập, redirect đến trang home
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/home']);
        return false;
      }
    }
    // Cho phép truy cập nếu chưa đăng nhập
    return true;
  }
}
