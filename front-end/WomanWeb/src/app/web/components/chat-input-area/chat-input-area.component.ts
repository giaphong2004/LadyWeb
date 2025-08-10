import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-chat-input-area',
  standalone: false,
  templateUrl: './chat-input-area.component.html',
  styleUrl: './chat-input-area.component.css'
})
export class ChatInputAreaComponent {
  @Output() messageSent = new EventEmitter<string>();
  messageContent: string = '';

  sendMessage(): void {
    const content = this.messageContent.trim();
    if (content) {
      this.messageSent.emit(content);
      this.messageContent = ''; // Xóa input sau khi gửi
    }
  }
}
