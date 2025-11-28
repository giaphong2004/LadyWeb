import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, HostListener } from '@angular/core';
// SỬA LỖI: Import từ các đường dẫn gốc của RxJS
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, switchMap, filter, take } from 'rxjs/operators';
import { Conversation, Expert, Message, User } from '../../../shared/models/chat.models';
import { ChatApiService } from '../../../shared/services/chat-api.service';
import { ChatSocketService } from '../../../shared/services/chat-socket.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ActivatedRoute } from '@angular/router';

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

  // Mobile sidebar state
  isSidebarOpen: boolean = true;

  constructor(
    private chatApi: ChatApiService,
    private chatSocket: ChatSocketService,
    private authService: AuthService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id || null;
    if (!this.currentUserId) { return; }

    this.chatSocket.connect();
    this.loadInitialData();
    this.listenForNewMessages();
    this.listenForMessageErrors();

    // LOGIC MỚI: Xử lý route khi component được khởi tạo
    this.handleRouteParameters();

    // Check initial screen size for sidebar state
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    // On mobile (<=576px), sidebar is hidden by default
    // On larger screens, sidebar is always visible
    if (window.innerWidth <= 576) {
      this.isSidebarOpen = !this.selectedConversation; // Show sidebar if no chat selected
    } else {
      this.isSidebarOpen = true;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    if (window.innerWidth <= 576) {
      this.isSidebarOpen = false;
    }
  }

  // --- HÀM ĐÃ SỬA LỖI ---
  private handleRouteParameters(): void {
    const expertIdParam = this.route.snapshot.paramMap.get('expertId');
    if (!expertIdParam) {
      return; // Không có ID, không làm gì cả.
    }
    const expertId = +expertIdParam;

    // Sử dụng combineLatest để đợi cả 2 stream có dữ liệu
    combineLatest([this.experts$, this.conversations$]).pipe(
      // Lọc để đảm bảo cả 2 danh sách đều đã được tải (không rỗng)
      filter(([experts, conversations]) => experts.length > 0 && conversations.length > 0),
      // Chỉ lấy 1 lần rồi hủy
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(([experts, conversations]) => {
      // Bây giờ chúng ta chắc chắn đã có cả danh sách chuyên gia và cuộc trò chuyện
      const existingConvo = conversations.find(c => c.expert_id === expertId);

      if (existingConvo) {
        // TÌM THẤY: Mở cuộc trò chuyện cũ
        this.zone.run(() => {
          this.onConversationSelected(existingConvo);
        });
      } else {
        // KHÔNG TÌM THẤY: Tìm chuyên gia để tạo cuộc trò chuyện mới
        const selectedExpert = experts.find(e => e.id === expertId);
        if (selectedExpert) {
          this.zone.run(() => {
            this.onExpertSelected(selectedExpert);
          });
        }
      }
    });
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
        // để đảm bảo tab "Trò chuyện" luôn được cập nhật
        switchMap(newMessage => {
          // FIX: Backend gửi conversationId (camelCase), frontend dùng conversation_id (snake_case)
          // Chuẩn hóa message để có cả 2 trường
          const conversationId = (newMessage as any).conversationId || newMessage.conversation_id;
          if ((newMessage as any).conversationId && !newMessage.conversation_id) {
            newMessage.conversation_id = (newMessage as any).conversationId;
          }

          // Lấy sender_id từ message (có thể là senderId hoặc sender_id)
          const senderId = (newMessage as any).senderId || newMessage.sender_id;

          // Bọc đoạn code cập nhật giao diện trong zone.run()
          this.zone.run(() => {
            if (this.selectedConversation?.id && conversationId === this.selectedConversation.id) {
              
              // FIX: Nếu tin nhắn này là của chính mình (đã được thêm bởi optimistic update)
              // thì chỉ cập nhật ID thật, không thêm mới
              if (senderId === this.currentUserId) {
                // Tìm tin nhắn tạm thời dựa trên content và thời gian gần đây
                const tempMessageIndex = this.messages.findIndex(
                  msg => msg.sender_id === this.currentUserId &&
                    msg.content === newMessage.content &&
                    // Tin nhắn tạm thời có ID là timestamp (số lớn) hoặc chưa có ID thật từ server
                    (msg.id > 1000000000000 || msg.id === 0)
                );

                if (tempMessageIndex !== -1) {
                  // Cập nhật tin nhắn tạm thời với dữ liệu thật từ server
                  this.messages[tempMessageIndex] = {
                    ...this.messages[tempMessageIndex],
                    id: newMessage.id, // Cập nhật ID thật
                    createdAt: newMessage.createdAt
                  };
                  this.cdr.detectChanges();
                }
                // Nếu không tìm thấy tin nhắn tạm (trường hợp hiếm), không làm gì
                // để tránh duplicate
              } else {
                // Tin nhắn từ người khác - kiểm tra trùng lặp trước khi thêm
                const isDuplicate = this.messages.some(
                  msg => msg.id === newMessage.id || 
                    (msg.sender_id === senderId && 
                     msg.content === newMessage.content &&
                     Math.abs(new Date(msg.createdAt).getTime() - new Date(newMessage.createdAt).getTime()) < 2000)
                );

                if (!isDuplicate) {
                  this.messages = [...this.messages, newMessage];
                  this.cdr.detectChanges();
                }
              }
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
