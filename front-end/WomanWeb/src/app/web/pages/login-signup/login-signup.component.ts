// 1. Thêm các import cần thiết ở đầu file
import { Component, OnInit, OnDestroy, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login-signup',
  templateUrl: './login-signup.component.html',
  styleUrls: ['./login-signup.component.css'],
  standalone: false // Nếu bạn sử dụng Angular standalone components, hãy để false
})
export class LoginSignupComponent implements OnInit, OnDestroy {

  isLoginMode: boolean = true;

  // 2. "Tiêm" PLATFORM_ID và Renderer2 vào constructor
  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // 3. Chỉ chạy code này nếu đang ở trên trình duyệt
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.addClass(document.body, 'login-page-background');
    }
  }

  ngOnDestroy(): void {
    // 4. Tương tự, chỉ chạy code này nếu đang ở trên trình duyệt
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.removeClass(document.body, 'login-page-background');
    }
  }

  // Các hàm chuyển đổi form giữ nguyên
  switchToSignup(): void {
    this.isLoginMode = false;
  }

  switchToLogin(): void {
    this.isLoginMode = true;
  }
}
