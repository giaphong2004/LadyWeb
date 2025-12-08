// src/app/shared/services/chat-socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { Message } from '../models/chat.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService {
  private socket: Socket;
  private messageSubject = new Subject<Message>();
  private errorSubject = new Subject<any>();
  private typingSubject = new Subject<{ userId: number; isTyping: boolean }>();
  private listenersRegistered = false;

  constructor(private authService: AuthService) {
    // Khởi tạo socket nhưng chưa kết nối
    this.socket = io('https://woman-web-production.up.railway.app', {
      autoConnect: false
    });
  }

  // Kết nối đến server và xác thực
  connect() {
    if (this.socket.disconnected) {
      this.socket.connect();

      // Gửi sự kiện authenticate ngay sau khi kết nối
      this.socket.on('connect', () => {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.socket.emit('authenticate', {
            id: currentUser.id,
            email: currentUser.email
          });
        }
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Đăng ký listeners chỉ MỘT LẦN duy nhất
      if (!this.listenersRegistered) {
        this.registerSocketListeners();
        this.listenersRegistered = true;
      }
    }
  }

  // Đăng ký tất cả socket listeners một lần duy nhất
  private registerSocketListeners() {
    this.socket.on('receive_message', (message: Message) => {
      this.messageSubject.next(message);
    });

    this.socket.on('message_error', (error: any) => {
      console.error('Message error:', error);
      this.errorSubject.next(error);
    });

    this.socket.on('user_typing', (data: { userId: number; isTyping: boolean }) => {
      this.typingSubject.next(data);
    });
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

  // Lắng nghe tin nhắn mới - giờ chỉ trả về Observable từ Subject
  onNewMessage(): Observable<Message> {
    return this.messageSubject.asObservable();
  }

  // Lắng nghe lỗi gửi tin nhắn
  onMessageError(): Observable<any> {
    return this.errorSubject.asObservable();
  }

  // Lắng nghe trạng thái typing
  onUserTyping(): Observable<{ userId: number; isTyping: boolean }> {
    return this.typingSubject.asObservable();
  }
}
