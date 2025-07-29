import { Component, OnInit } from '@angular/core';
// 1. Import ActivatedRoute từ thư viện router của Angular
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service'; // Import AuthService
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-login',
  standalone: false,
  templateUrl: './form-login.component.html',
  styleUrl: './form-login.component.css'
})
// 2. Implement OnInit để sử dụng lifecycle hook
export class FormLoginComponent implements OnInit {
  isLoginMode = true;
  loginForm!: FormGroup;
  signupForm!: FormGroup;

  // 1. Inject các service cần thiết
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Xử lý chuyển đổi giao diện dựa trên URL
    this.route.queryParams.subscribe(params => {
      this.isLoginMode = params['view'] !== 'signup';
    });

    // 2. Khởi tạo form đăng nhập
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // 3. Khởi tạo form đăng ký
    this.signupForm = this.fb.group({
      full_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // terms: [false, Validators.requiredTrue]
    });
  }

  // 4. Hàm xử lý sự kiện submit form đăng nhập
  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      return; // Dừng lại nếu form không hợp lệ
    }
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Đăng nhập thành công!',
          text: 'Chào mừng bạn trở lại với LadyHeath!',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
        // Lưu token vào localStorage
        localStorage.setItem('authToken', response.token);
        // Điều hướng đến trang chính sau khi đăng nhập
        this.router.navigate(['/']);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Đăng nhập thất bại',
          text: err.error.message,
        });
      }
    });
  }

  // 5. Hàm xử lý sự kiện submit form đăng ký
  onRegisterSubmit(): void {
    if (this.signupForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Thông tin chưa hợp lệ',
        text: 'Vui lòng điền đầy đủ và đúng thông tin.',
      });
      return;
    }
    this.authService.register(this.signupForm.value).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Bạn đã tạo tài khoản thành công! Vui lòng đăng nhập.',
        });
        // 👇 THÊM DÒNG NÀY ĐỂ XÓA SẠCH FORM 👇
        this.signupForm.reset();
        this.switchToLogin();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Đăng ký thất bại',
          text: err.error.message,
        });
      }
    });
  }

  // Các hàm chuyển đổi giao diện
  switchToSignup(): void {
    this.isLoginMode = false;
    this.router.navigate([], { queryParams: { view: 'signup' } });
  }

  switchToLogin(): void {
    this.isLoginMode = true;
    this.router.navigate([], { queryParams: { view: null } });
  }

  get password() {
    return this.signupForm.get('password');
  }
}

