import { Component, OnInit } from '@angular/core';
// 1. Import ActivatedRoute từ thư viện router của Angular
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-form-login',
  standalone: false,
  templateUrl: './form-login.component.html',
  styleUrl: './form-login.component.css'
})
// 2. Implement OnInit để sử dụng lifecycle hook
export class FormLoginComponent implements OnInit {
  isLoginMode: boolean = true;

  // 3. Inject ActivatedRoute vào constructor
  constructor(private route: ActivatedRoute) { }

  // 4. Dùng ngOnInit để đọc query params ngay khi component được khởi tạo
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Kiểm tra xem trên URL có tham số `view` và giá trị của nó có phải là 'signup' không
      if (params['view'] === 'signup') {
        this.isLoginMode = false; // Nếu có, hiển thị form đăng ký
      } else {
        this.isLoginMode = true; // Mặc định hoặc các trường hợp khác, hiển thị form đăng nhập
      }
    });
  }

  switchToSignup(): void {
    this.isLoginMode = false;
  }

  switchToLogin(): void {
    this.isLoginMode = true;
  }
}
