import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'https://ladyweb-api.onrender.com/api/posts';

  constructor(private http: HttpClient) { }

  // READ: Lấy tất cả bài viết
  getPosts(searchTerm: string = ''): Observable<any[]> {
    // Thêm query parameter ?search=... vào URL
    return this.http.get<any[]>(`${this.apiUrl}?search=${searchTerm}`);
  }

  // READ: Lấy một bài viết theo ID
  getPostById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // CREATE: Tạo bài viết mới
  createPost(postData: any): Observable<any> {
    return this.http.post(this.apiUrl, postData);
  }

  // UPDATE: Cập nhật bài viết
  updatePost(id: number, postData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, postData);
  }

  // DELETE: Xóa bài viết
  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
