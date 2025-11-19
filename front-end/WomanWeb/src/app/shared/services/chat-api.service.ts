// src/app/shared/services/chat-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Conversation, Expert, Message } from '../models/chat.models';


@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  private apiUrl = 'https://ladyweb-api.onrender.com/api'; // Ví dụ: 'https://ladyweb-api.onrender.com/api'

  constructor(private http: HttpClient) { }

  // Lấy danh sách tất cả chuyên gia để bắt đầu chat
  getExpertsForChat(): Observable<Expert[]> {
    const url = `${this.apiUrl}/public/experts?limit=1000`;

    // Gọi API với limit lớn để lấy tất cả chuyên gia (không phân trang)
    return this.http.get<{ experts: any[] }>(url).pipe(
      map(response => {
        // Transform data từ public API thành format cho chat
        return response.experts.map(expert => ({
          id: expert.id,
          full_name: expert.full_name,
          avatar_url: expert.avatar_url,
          isOnline: false // Có thể tích hợp với socket để check online status
        }));
      })
    );
  }

  // Lấy danh sách các cuộc trò chuyện đã có của user
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/chat/conversations`);
  }

  // Tạo hoặc lấy conversation ID khi click vào một chuyên gia
  getOrCreateConversation(expertId: number): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.apiUrl}/chat/conversations`, { expertId });
  }

  // Lấy lịch sử tin nhắn của một cuộc trò chuyện
  getMessages(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/chat/conversations/${conversationId}/messages`);
  }
}
