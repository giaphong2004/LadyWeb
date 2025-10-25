import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../shared/services/auth.service';

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

  constructor(private authService: AuthService) { }

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

    // Simulate AI typing
    this.isTyping = true;

    setTimeout(() => {
      // Add AI response (mock - sẽ connect API sau)
      const aiMessage: Message = {
        id: this.generateId(),
        text: this.getMockResponse(messageText),
        sender: 'ai',
        timestamp: new Date(),
        suggestions: ['Tìm hiểu thêm', 'Xem công cụ', 'Hỏi chuyên gia']
      };
      this.messages.push(aiMessage);
      this.isTyping = false;
      this.shouldScrollToBottom = true;
    }, 1500 + Math.random() * 1000); // Random delay 1.5-2.5s
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

  private getMockResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    const responses: { [key: string]: string } = {
      'chu kỳ': 'Chu kỳ kinh nguyệt bình thường kéo dài từ 21-35 ngày. Bạn có thể sử dụng công cụ theo dõi chu kỳ của chúng tôi để ghi lại và dự đoán chu kỳ tiếp theo một cách chính xác nhất.\n\n💡 Mẹo: Ghi chú thường xuyên sẽ giúp bạn hiểu rõ hơn về cơ thể mình!',
      'kinh nguyệt': 'Kỳ kinh thường kéo dài từ 3-7 ngày. Nếu bạn gặp các triệu chứng bất thường như đau quá mức, chảy máu nhiều hoặc kéo dài, hãy tham khảo ý kiến bác sĩ chuyên khoa nhé!\n\n📊 Sử dụng công cụ theo dõi để monitor tình trạng của bạn.',
      'rụng trứng': 'Ngày rụng trứng thường xảy ra vào giữa chu kỳ, khoảng 14 ngày trước kỳ kinh tiếp theo. Công cụ dự đoán rụng trứng của chúng tôi sẽ giúp bạn tính toán chính xác dựa trên chu kỳ riêng của bạn.\n\n🎯 Khả năng thụ thai cao nhất trong khoảng 5 ngày trước và 1 ngày sau khi rụng trứng.',
      'thai': 'Các dấu hiệu mang thai sớm bao gồm:\n• Trễ kinh\n• Buồn nôn, đặc biệt vào buổi sáng\n• Mệt mỏi\n• Ngực căng, đau\n• Tiểu nhiều hơn bình thường\n\n🧪 Hãy làm test thử thai để chắc chắn và tham khảo bác sĩ sản khoa.',
      'đau': 'Để giảm đau bụng kinh tự nhiên, bạn có thể:\n• Chườm nóng vùng bụng dưới\n• Massage nhẹ nhàng\n• Uống nước ấm, trà gừng\n• Nghỉ ngơi đầy đủ\n• Tập thể dục nhẹ như yoga\n\n⚠️ Nếu đau quá mức, hãy gặp bác sĩ để kiểm tra.',
      'dinh dưỡng': 'Chế độ dinh dưỡng cân bằng cho phụ nữ nên bao gồm:\n• Rau xanh, trái cây đa dạng\n• Protein chất lượng (cá, thịt nạc, đậu)\n• Canxi từ sữa, phô mai\n• Sắt từ rau xanh, thịt đỏ\n• Uống đủ 2-2.5L nước/ngày\n\n🥗 Mỗi bữa ăn nên có đủ 4 nhóm thực phẩm!',
      'tập': 'Các bài tập phù hợp cho phụ nữ:\n• Yoga - Tăng sự dẻo dai\n• Đi bộ - 30 phút/ngày\n• Bơi lội - Toàn thân\n• Pilates - Tăng cường core\n• Cardio nhẹ\n\n💪 Nên tập 3-5 lần/tuần, mỗi lần 30-45 phút!'
    };

    for (const [key, value] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return value;
      }
    }

    return `Cảm ơn bạn đã hỏi! 😊\n\nTôi là Lisa, trợ lý ảo chuyên về sức khỏe phụ nữ. Tôi có thể giúp bạn về nhiều vấn đề như chu kỳ kinh nguyệt, rụng trứng, mang thai, chăm sóc sức khỏe...\n\nBạn có thể đặt câu hỏi cụ thể hơn hoặc chọn một trong các câu hỏi gợi ý bên dưới nhé! 💕`;
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
}
