import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) { }

  getUsers(searchTerm: string = ''): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?search=${searchTerm}`);
  }

  // --- THÊM CÁC HÀM MỚI ---
  createUser(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, userData);
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateProfile(profileData: any): Observable<any> {
    // Gọi đến API endpoint mới mà chúng ta vừa tạo
    return this.http.put(`${this.apiUrl}/profile`, profileData);
  }
}

