import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';


// (Tùy chọn) Tạo một interface để định nghĩa cấu trúc User
export interface User {
  id: number;
  email: string;
  full_name: string;
  // Thêm các thuộc tính khác nếu có
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  // Subject cho trạng thái đăng nhập
  private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this._isLoggedIn$.asObservable();

  // BehaviorSubject để quản lý thông tin user
  private _currentUser$ = new BehaviorSubject<User | null>(null);
  public currentUser$ = this._currentUser$.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // 👈 Inject PLATFORM_ID để biết môi trường chạy
  ) {
    // Chỉ chạy code này nếu đang ở trên trình duyệt
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserFromStorage();
    }
  }

  // Tách logic load từ storage ra hàm riêng cho gọn
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    if (token && user) {
      this._isLoggedIn$.next(true);
      this._currentUser$.next(JSON.parse(user));
    }
  }

  // Cập nhật hàm login
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.token && response.user) {
          // Chỉ lưu vào localStorage nếu đang ở trình duyệt
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          }
          this._isLoggedIn$.next(true);
          this._currentUser$.next(response.user);
        }
      })
    );
  }

  // Cập nhật hàm logout
  logout(): void {
    // Chỉ xóa khỏi localStorage nếu đang ở trình duyệt
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
    this._isLoggedIn$.next(false);
    this._currentUser$.next(null);
    this.router.navigate(['/auth']);
  }

  // hàm register không thay đổi
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
}
