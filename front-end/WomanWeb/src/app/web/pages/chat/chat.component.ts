import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
// SỬA LỖI: Import từ các đường dẫn gốc của RxJS
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { Conversation, Expert, Message, User } from '../../../shared/models/chat.models';
import { ChatApiService } from '../../../shared/services/chat-api.service';
import { ChatSocketService } from '../../../shared/services/chat-socket.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  private expertsSubject = new BehaviorSubject<Expert[]>([]);
  experts$: Observable<Expert[]> = this.expertsSubject.asObservable();

  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  conversations$: Observable<Conversation[]> = this.conversationsSubject.asObservable();

  messages: Message[] = [];

  // QUAN TRỌNG: Biến này giờ có thể chứa một cuộc trò chuyện thật (có id)
  // hoặc một cuộc trò chuyện "tạm" (chưa có id)
  selectedConversation: Partial<Conversation> | null = null;

  currentUserId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private chatApi: ChatApiService,
    private chatSocket: ChatSocketService,
    private authService: AuthService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id || null;
    if (!this.currentUserId) { return; }

    this.chatSocket.connect();
    this.loadInitialData();
    this.listenForNewMessages();
    this.listenForMessageErrors();
  }

  ngOnDestroy(): void {
    this.chatSocket.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInitialData(): void {
    this.chatApi.getExpertsForChat()
      .pipe(takeUntil(this.destroy$))
      .subscribe(experts => {
        this.expertsSubject.next(experts);
      });

    this.chatApi.getConversations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(conversations => this.conversationsSubject.next(conversations));
  }

  // --- LOGIC ĐÃ SỬA ---
  // Hàm này giờ sẽ xử lý việc cập nhật cả tin nhắn và danh sách trò chuyện
  listenForNewMessages(): void {
    this.chatSocket.onNewMessage()
      .pipe(
        // Mỗi khi có tin nhắn mới, chúng ta sẽ tải lại danh sách cuộc trò chuyện
        // để đảm bảo tab "Trò chuyện" luôn được cập nhật (Fix cho Yêu cầu 2)
        switchMap(newMessage => {
          // 3. Bọc đoạn code cập nhật giao diện trong zone.run()
          this.zone.run(() => {
            if (this.selectedConversation?.id && newMessage.conversation_id === this.selectedConversation.id) {
              // Kiểm tra xem tin nhắn đã tồn tại trong mảng chưa (tránh trùng lặp với optimistic update)
              const existingMessageIndex = this.messages.findIndex(
                msg => msg.sender_id === newMessage.sender_id &&
                  msg.content === newMessage.content &&
                  Math.abs(new Date(msg.createdAt).getTime() - new Date(newMessage.createdAt).getTime()) < 5000 // Trong vòng 5 giây
              );

              if (existingMessageIndex !== -1) {
                // Thay thế tin nhắn tạm thời bằng tin nhắn thật từ server
                this.messages[existingMessageIndex] = newMessage;
              } else {
                // Nếu không tìm thấy tin nhắn tạm thời, thêm tin nhắn mới
                // (Trường hợp tin nhắn từ người khác)
                if (newMessage.sender_id !== this.currentUserId) {
                  this.messages = [...this.messages, newMessage];
                }
              }
              this.cdr.detectChanges(); // Buộc Angular kiểm tra thay đổi
            }
          });
          // Luôn tải lại danh sách
          return this.chatApi.getConversations();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(conversations => {
        // Cập nhật kho chứa, sidebar sẽ tự động thay đổi
        this.conversationsSubject.next(conversations);
      });
  }

  // Lắng nghe lỗi gửi tin nhắn
  listenForMessageErrors(): void {
    this.chatSocket.onMessageError()
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        console.error('Message error:', error);
        // Có thể hiển thị thông báo lỗi cho người dùng ở đây
        // Ví dụ: sử dụng một toast notification service
      });
  }

  // --- LOGIC MỚI KHI CLICK VÀO CHUYÊN GIA ---
  onExpertSelected(expert: Expert): void {
    const existingConvo = this.conversationsSubject.getValue().find(c => c.expert_id === expert.id);

    if (existingConvo) {
      // Nếu đã có, chọn như bình thường
      this.onConversationSelected(existingConvo);
    } else {
      // Nếu chưa có, tạo một cuộc trò chuyện "TẠM THỜI" ở frontend
      // Nó chưa được lưu vào database và chưa có 'id'
      this.selectedConversation = {
        expert: expert,
        user: {
          ...this.authService.getCurrentUser()!,
          role: 'user' // Ensure role matches chat.models.User type
        } as User
      };
      // Xóa các tin nhắn cũ và hiển thị khung chat trống
      this.messages = [];
    }
  }

  onConversationSelected(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.chatSocket.joinConversation(conversation.id);
    this.chatApi.getMessages(conversation.id).subscribe(messages => {
      this.messages = messages;
    });
  }

  // --- LOGIC ĐÃ SỬA ---
  onMessageSent(content: string): void {
    if (!this.selectedConversation || !this.currentUserId || !content.trim()) return;

    // Tạo tin nhắn tạm thời để hiển thị ngay lập tức (Optimistic Update)
    const tempMessage: Message = {
      id: Date.now(), // ID tạm thời
      conversation_id: this.selectedConversation.id || 0,
      sender_id: this.currentUserId,
      content: content.trim(),
      type: 'text',
      createdAt: new Date().toISOString(),
      sender: {
        id: this.currentUserId,
        full_name: this.authService.getCurrentUser()?.full_name || 'Bạn',
        avatar_url: this.authService.getCurrentUser()?.avatar_url || null,
        email: this.authService.getCurrentUser()?.email || '',
        role: 'user'
      }
    };

    // Thêm tin nhắn tạm thời vào UI ngay lập tức
    this.zone.run(() => {
      this.messages = [...this.messages, tempMessage];
      this.cdr.detectChanges(); // Buộc Angular kiểm tra thay đổi
    });

    // Trường hợp 1: Gửi tin nhắn trong cuộc trò chuyện đã có (có id)
    if (this.selectedConversation.id) {
      const messageData = {
        conversationId: this.selectedConversation.id,
        senderId: this.currentUserId,
        content: content.trim()
      };
      this.chatSocket.sendMessage(messageData);
    }
    // Trường hợp 2: Đây là TIN NHẮN ĐẦU TIÊN (cuộc trò chuyện chưa có id)
    else {
      const expertId = (this.selectedConversation.expert as User).id;

      this.chatApi.getOrCreateConversation(expertId).pipe(
        takeUntil(this.destroy$)
      ).subscribe(newConvo => {
        // FIX CHO YÊU CẦU 1:
        // Cập nhật cuộc trò chuyện "tạm" thành cuộc trò chuyện "thật" với ID.
        // Giờ đây, các tin nhắn tiếp theo sẽ được gửi đi bình thường.
        this.selectedConversation!.id = newConvo.id;

        // Cập nhật conversation_id của tin nhắn tạm thời
        this.zone.run(() => {
          const messageIndex = this.messages.findIndex(m => m.id === tempMessage.id);
          if (messageIndex !== -1) {
            this.messages[messageIndex].conversation_id = newConvo.id;
            this.cdr.detectChanges();
          }
        });

        this.chatSocket.joinConversation(newConvo.id);

        const messageData = {
          conversationId: newConvo.id,
          senderId: this.currentUserId!,
          content: content.trim()
        };
        this.chatSocket.sendMessage(messageData);
        // Hàm listenForNewMessages sẽ tự động cập nhật danh sách trò chuyện
      });
    }
  }

  getChatPartner(): User | null {
    if (!this.selectedConversation) return null;

    if (this.authService.getCurrentUserRole() === 'user') {
      return this.selectedConversation.expert as User;
    }
    return this.selectedConversation.user as User;
  }
}
