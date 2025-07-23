import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. Lấy token từ localStorage
    const authToken = localStorage.getItem('authToken');

    // 2. Nếu có token, sao chép request và thêm header 'Authorization'
    if (authToken) {
      const authReq = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${authToken}`)
      });
      // 3. Gửi request đã được thêm token đi
      return next.handle(authReq);
    }

    // Nếu không có token, cho request đi tiếp mà không thay đổi
    return next.handle(request);
  }
}
