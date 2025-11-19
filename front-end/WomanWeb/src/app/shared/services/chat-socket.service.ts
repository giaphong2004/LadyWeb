// src/app/shared/services/chat-socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Message } from '../models/chat.models';
// Giả sử bạn có AuthService để lấy thông tin user và token
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService {
  private socket: Socket;

  constructor(private authService: AuthService) {
    // Khởi tạo socket nhưng chưa kết nối
    this.socket = io('https://ladyweb-production.up.railway.app', {
      autoConnect: false
    });
  }

  // Kết nối đến server và xác thực
  connect() {
    if (this.socket.disconnected) {
      this.socket.connect();

      // Gửi sự kiện authenticate ngay sau khi kết nối
      this.socket.on('connect', () => {
        const currentUser = this.authService.getCurrentUser(); // Hàm này cần có trong AuthService
        if (currentUser) {
          this.socket.emit('authenticate', {
            id: currentUser.id,
            email: currentUser.email
          });
          console.log('Socket authenticated for user:', currentUser.id);
        }
      });
    }
  }

  // Ngắt kết nối
  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // Tham gia vào một phòng trò chuyện
  joinConversation(conversationId: number) {
    this.socket.emit('join_conversation', conversationId);
  }

  // Gửi tin nhắn
  sendMessage(data: { conversationId: number; senderId: number; content: string; }) {
    this.socket.emit('send_message', data);
  }

  // Lắng nghe tin nhắn mới
  onNewMessage(): Observable<Message> {
    return new Observable(observer => {
      this.socket.on('receive_message', (message: Message) => {
        observer.next(message);
      });
    });
  }

  // Lắng nghe lỗi gửi tin nhắn
  onMessageError(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('message_error', (error: any) => {
        observer.next(error);
      });
    });
  }

  // Lắng nghe trạng thái typing
  onUserTyping(): Observable<{ userId: number; isTyping: boolean }> {
    return new Observable(observer => {
      this.socket.on('user_typing', (data) => {
        observer.next(data);
      });
    });
  }
}
