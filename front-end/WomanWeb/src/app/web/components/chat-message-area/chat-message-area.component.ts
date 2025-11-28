import { AfterViewChecked, Component, ElementRef, Input, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { Message } from '../../../shared/models/chat.models';

@Component({
  selector: 'app-chat-message-area',
  standalone: false,
  templateUrl: './chat-message-area.component.html',
  styleUrl: './chat-message-area.component.css'
})
export class ChatMessageAreaComponent implements AfterViewChecked, OnChanges {
  @Input() messages: Message[] = [];
  @Input() currentUserId: number | null = null;
  @Input() conversationId: number | null = null;
  @ViewChild('messageContainer') private messageContainer: ElementRef;

  private shouldScroll = false;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    // Khi messages thay đổi, đánh dấu cần scroll
    if (changes['messages'] && !changes['messages'].firstChange) {
      this.shouldScroll = true;
    }
  }

  ngAfterViewChecked() {
    // Tự động cuộn xuống tin nhắn mới nhất
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  // TrackBy function để cải thiện performance
  trackByMessageId(index: number, message: Message): any {
    return message.id;
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
