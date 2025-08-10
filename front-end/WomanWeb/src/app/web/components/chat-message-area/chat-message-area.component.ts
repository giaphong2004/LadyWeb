import { AfterViewChecked, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Message } from '../../../shared/models/chat.models';

@Component({
  selector: 'app-chat-message-area',
  standalone: false,
  templateUrl: './chat-message-area.component.html',
  styleUrl: './chat-message-area.component.css'
})
export class ChatMessageAreaComponent implements AfterViewChecked {
  @Input() messages: Message[] = [];
  @Input() currentUserId: number | null = null;
  @ViewChild('messageContainer') private messageContainer: ElementRef;

  ngAfterViewChecked() {
    // Tự động cuộn xuống tin nhắn mới nhất
    this.scrollToBottom();
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
