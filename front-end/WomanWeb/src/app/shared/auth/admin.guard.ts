import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): boolean {
    // 1. Kiểm tra đăng nhập
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']); // Về trang login nếu chưa đăng nhập
      return false;
    }

    // 2. Kiểm tra vai trò
    if (this.authService.getCurrentUserRole() === 'admin') {
      return true; // Cho phép truy cập nếu là admin
    } else {
      // Nếu không phải admin, thông báo và về trang chủ
      Swal.fire({
        icon: 'error',
        title: 'Truy cập bị từ chối',
        text: 'Bạn không có quyền truy cập vào trang này!',
      });
      this.router.navigate(['/']);
      return false;
    }
  }
}
