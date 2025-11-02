import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../shared/services/auth.service';
import { AiService, ChatHistory } from '../../../shared/services/ai.service';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
}

interface QuickQuestion {
  id: number;
  icon: string;
  text: string;
  category: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.css']
})
export class AiAssistantComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  isOpen = false;
  isMinimized = false;
  messages: Message[] = [];
  currentMessage = '';
  isTyping = false;
  showWelcome = true;
  currentUser: User | null = null;
  isLoggedIn = false;

  quickQuestions: QuickQuestion[] = [
    { id: 1, icon: '📅', text: 'Chu kỳ kinh nguyệt của tôi bất thường', category: 'cycle' },
    { id: 2, icon: '🔮', text: 'Cách tính ngày rụng trứng chính xác', category: 'ovulation' },
    { id: 3, icon: '👶', text: 'Dấu hiệu mang thai sớm', category: 'pregnancy' },
    { id: 4, icon: '💊', text: 'Giảm đau bụng kinh tự nhiên', category: 'health' },
    { id: 5, icon: '🥗', text: 'Chế độ dinh dưỡng cho phụ nữ', category: 'nutrition' },
    { id: 6, icon: '🏃‍♀️', text: 'Bài tập thể dục phù hợp', category: 'exercise' }
  ];

  private shouldScrollToBottom = false;

  constructor(
    private authService: AuthService,
    private aiService: AiService
  ) { }

  ngOnInit(): void {
    // Lấy thông tin user hiện tại
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });

    this.addWelcomeMessage();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private addWelcomeMessage(): void {
    const welcomeMessage: Message = {
      id: this.generateId(),
      text: 'Xin chào! Tôi là Lisa - trợ lý ảo của LadyWeb 👋\n\nTôi có thể giúp bạn về:\n• Chu kỳ kinh nguyệt và theo dõi\n• Tính ngày rụng trứng\n• Thai kỳ và mang thai\n• Sức khỏe và dinh dưỡng\n• Lời khuyên chăm sóc bản thân\n\nHãy chọn một câu hỏi bên dưới hoặc gõ câu hỏi của bạn nhé! 💕',
      sender: 'ai',
      timestamp: new Date(),
      suggestions: ['Xem công cụ', 'Tư vấn chuyên gia', 'Đọc bài viết']
    };
    this.messages.push(welcomeMessage);
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isMinimized = false;
      setTimeout(() => {
        this.focusInput();
        this.shouldScrollToBottom = true;
      }, 300);
    }
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
    if (!this.isMinimized) {
      setTimeout(() => {
        this.shouldScrollToBottom = true;
      }, 100);
    }
  }

  sendMessage(text?: string): void {
    const messageText = text || this.currentMessage.trim();
    if (!messageText || this.isTyping) return;

    // Add user message
    const userMessage: Message = {
      id: this.generateId(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    this.currentMessage = '';
    this.showWelcome = false;
    this.shouldScrollToBottom = true;

    // Call real AI API
    this.isTyping = true;

    // Prepare chat history for context
    const history: ChatHistory[] = this.messages
      .slice(-10) // Lấy 10 tin nhắn gần nhất
      .map(msg => ({
        sender: msg.sender === 'user' ? 'user' : 'lisa',
        text: msg.text
      }));

    // Call AI Service
    this.aiService.chat(messageText, history).subscribe({
      next: (response) => {
        const aiMessage: Message = {
          id: this.generateId(),
          text: response,
          sender: 'ai',
          timestamp: new Date(),
          suggestions: ['Tìm hiểu thêm', 'Xem công cụ', 'Hỏi chuyên gia']
        };
        this.messages.push(aiMessage);
        this.isTyping = false;
        this.shouldScrollToBottom = true;
      },
      error: (error) => {
        console.error('AI Error:', error);
        // Fallback nếu API lỗi
        const errorMessage: Message = {
          id: this.generateId(),
          text: 'Xin lỗi, tôi đang gặp chút vấn đề. Vui lòng thử lại sau nhé! 🙏',
          sender: 'ai',
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
        this.isTyping = false;
        this.shouldScrollToBottom = true;
      }
    });
  }

  selectQuickQuestion(question: QuickQuestion): void {
    this.showWelcome = false;
    this.sendMessage(question.text);
  }

  clearChat(): void {
    if (confirm('Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện?')) {
      this.messages = [];
      this.showWelcome = true;
      this.addWelcomeMessage();
      this.shouldScrollToBottom = true;
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Lấy chữ cái đầu của tên user để làm avatar placeholder
   */
  getUserInitials(): string {
    if (!this.currentUser?.full_name) return 'U';

    const names = this.currentUser.full_name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    // Lấy chữ cái đầu của tên đầu và tên cuối
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        const element = this.chatContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  private focusInput(): void {
    try {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    } catch (err) {
      console.error('Focus error:', err);
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
