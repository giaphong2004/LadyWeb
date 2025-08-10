import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Expert } from '../../../shared/models/chat.models';
import { Conversation } from '../../../shared/models/chat.models';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-chat-sidebar',
  standalone: false,
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.css'
})
export class ChatSidebarComponent {
  @Input() experts: Expert[] | null = [];
  @Input() conversations: Conversation[] | null = [];
  @Input() selectedConversationId: number | null = null;

  @Output() expertSelected = new EventEmitter<Expert>();
  @Output() conversationSelected = new EventEmitter<Conversation>();

  // Biến để quản lý tab đang hoạt động
  activeTab: 'conversations' | 'experts' = 'conversations';

  constructor(private authService: AuthService) { }

  // Getter để kiểm tra user role
  get currentUserRole(): string | null {
    return this.authService.getCurrentUserRole();
  }

  // Getter để kiểm tra xem có nên hiển thị tab "Chuyên gia" không
  get shouldShowExpertsTab(): boolean {
    return this.currentUserRole === 'user';
  }

  selectConversation(conversation: Conversation): void {
    this.conversationSelected.emit(conversation);
  }

  selectExpert(expert: Expert): void {
    this.expertSelected.emit(expert);
  }

  // Lấy avatar cho conversation dựa trên role của user hiện tại
  getConversationAvatar(conversation: Conversation): string | null {
    if (this.currentUserRole === 'expert') {
      // Nếu là expert, hiển thị avatar của user
      return conversation.user?.avatar_url || null;
    } else {
      // Nếu là user, hiển thị avatar của expert
      return conversation.expert?.avatar_url || null;
    }
  }

  // Lấy tên cho conversation dựa trên role của user hiện tại
  getConversationName(conversation: Conversation): string {
    if (this.currentUserRole === 'expert') {
      // Nếu là expert, hiển thị tên của user
      return conversation.user?.full_name || 'Unknown User';
    } else {
      // Nếu là user, hiển thị tên của expert
      return conversation.expert?.full_name || 'Unknown Expert';
    }
  }
}
