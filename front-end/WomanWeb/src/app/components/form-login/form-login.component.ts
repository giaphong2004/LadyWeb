import { Component, OnInit } from '@angular/core';
// 1. Import ActivatedRoute từ thư viện router của Angular
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Import AuthService để xử lý đăng nhập và đăng ký

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
      full_name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // 4. Hàm xử lý sự kiện submit form đăng nhập
  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      return; // Dừng lại nếu form không hợp lệ
    }
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        alert('Đăng nhập thành công!');
        // Lưu token vào localStorage
        localStorage.setItem('authToken', response.token);
        // Điều hướng đến trang chính sau khi đăng nhập
        this.router.navigate(['/']);
      },
      error: (err) => {
        alert(`Lỗi đăng nhập: ${err.error.message}`);
      }
    });
  }

  // 5. Hàm xử lý sự kiện submit form đăng ký
  // onSignupSubmit(): void {
  //   if (this.signupForm.invalid) {
  //     return;
  //   }
  //   this.authService.register(this.signupForm.value).subscribe({
  //     next: (response) => {
  //       alert('Đăng ký thành công! Vui lòng đăng nhập.');
  //       this.switchToLogin();
  //     },
  //     error: (err) => {
  //       alert(`Lỗi đăng ký: ${err.error.message}`);
  //     }
  //   });
  // }

  onSignupSubmit(): void {
    console.log('1. Nút Đăng ký đã được nhấn.'); // Kiểm tra xem hàm có được gọi không

    if (this.signupForm.invalid) {
      console.log('Form không hợp lệ, dừng lại.');
      return;
    }

    const formData = this.signupForm.value;
    console.log('2. Dữ liệu từ form chuẩn bị gửi đi:', formData); // Xem dữ liệu form

    this.authService.register(formData).subscribe({
      next: (response) => {
        console.log('4. Backend đã phản hồi thành công:', response); // Xem phản hồi thành công
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        this.switchToLogin();
      },
      error: (err) => {
        console.error('5. Backend đã phản hồi lỗi:', err); // Xem chi tiết lỗi
        alert(`Lỗi đăng ký: ${err.error.message}`);
      }
    });
    console.log('3. Đã gọi authService.register, đang chờ phản hồi từ backend...');
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
}
