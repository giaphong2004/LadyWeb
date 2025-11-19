import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';


// Interface cho ExpertProfile
export interface ExpertProfile {
  id?: number;
  user_id: number;
  title: string;
  bio: string;
  qualifications: string;
}

// (Tùy chọn) Tạo một interface để định nghĩa cấu trúc User
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'user' | 'admin' | 'expert';
  avatar_url?: string;
  ExpertProfile?: ExpertProfile;
  // Thêm các thuộc tính khác nếu có
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://ladyweb-production.up.railway.app/api/auth';

  // Subject cho trạng thái đăng nhập
  private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this._isLoggedIn$.asObservable();

  // BehaviorSubject để quản lý thông tin user
  private _currentUser$ = new BehaviorSubject<User | null>(null);
  public currentUser$ = this._currentUser$.asObservable();

  // --- THÊM MỚI: Subject để quản lý trạng thái loading ban đầu ---
  private _isLoading$ = new BehaviorSubject<boolean>(true);
  public isLoading$ = this._isLoading$.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
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
    // --- THÊM MỚI: Dù có user hay không, việc kiểm tra đã hoàn tất ---
    this._isLoading$.next(false);
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
    this.router.navigate(['/login']);
  }

  // hàm register không thay đổi
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  /**
   * Cập nhật thông tin user hiện tại
   */
  updateCurrentUser(userData: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
    this._currentUser$.next(userData);
  }

  /**
   * Kiểm tra xem người dùng đã đăng nhập hay chưa
   */
  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('authToken');
    }
    return false;
  }

  /**
   * Lấy vai trò của người dùng hiện tại
   */
  getCurrentUserRole(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const userString = localStorage.getItem('currentUser');
      if (userString) {
        const user: User = JSON.parse(userString);
        return user.role;
      }
    }
    return null;
  }

  setCurrentUser(user: User): void {
    // Cập nhật lại thông tin trong localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    // Phát tín hiệu thông tin người dùng mới cho các component khác
    this._currentUser$.next(user);
  }

  // ==========================================================
  // HÀM MỚI ĐƯỢC THÊM VÀO
  // ==========================================================

  /**
   * Lấy thông tin người dùng hiện tại một cách đồng bộ.
   * @returns User object or null.
   */
  public getCurrentUser(): User | null {
    return this._currentUser$.getValue();
  }

  /**
   * Lấy auth token từ localStorage.
   * @returns string or null.
   */
  public getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('authToken');
    }
    return null;
  }
}
