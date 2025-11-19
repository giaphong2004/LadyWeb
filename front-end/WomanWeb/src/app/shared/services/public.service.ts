import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PostQuery {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private apiUrl = 'https://ladyweb-api.onrender.com/api/public';


  constructor(private http: HttpClient) { }

  // Lấy danh sách bài viết công khai (hỗ trợ phân trang, tìm kiếm, lọc)
  getPosts(query: PostQuery): Observable<any> {
    let params = new HttpParams();
    if (query.page) params = params.append('page', query.page);
    if (query.limit) params = params.append('limit', query.limit);
    if (query.search) params = params.append('search', query.search);
    if (query.tag) params = params.append('tag', query.tag);

    return this.http.get(`${this.apiUrl}/posts`, { params });
  }

  // Lấy danh sách các tags
  getTags(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tags`);
  }

  // Lấy chi tiết một bài viết theo slug
  getPostBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/posts/${slug}`);
  }

  getExperts(query: PostQuery = {}): Observable<any> {
    let params = new HttpParams();
    if (query.page) params = params.append('page', query.page);
    if (query.limit) params = params.append('limit', query.limit);
    if (query.search) params = params.append('search', query.search);
    // Giả sử lọc theo chuyên khoa (specialty)
    if (query.tag) params = params.append('specialty', query.tag);

    return this.http.get(`${this.apiUrl}/experts`, { params });
  }

  getExpertById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/experts/${id}`);
  }
}
