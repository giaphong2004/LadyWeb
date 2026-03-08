import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpertService {
  // URL trỏ đến API backend của bạn
  private apiUrl = 'https://ladyweb-production.up.railway.app/api/experts';

  constructor(private http: HttpClient) { }

  getExperts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Gửi request POST để thêm một chuyên gia mới
   * @param expertData Dữ liệu chuyên gia từ form
   * @returns Observable chứa kết quả từ server
   */
  addExpert(expertData: any): Observable<any> {
    return this.http.post(this.apiUrl, expertData);
  }

  deleteExpert(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateExpert(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
