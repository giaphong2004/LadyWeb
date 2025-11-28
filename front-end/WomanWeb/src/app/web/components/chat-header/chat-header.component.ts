import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../shared/models/chat.models';

@Component({
  selector: 'app-chat-header',
  standalone: false,
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.css'
})
export class ChatHeaderComponent {
  @Input() chatPartner: User | null = null;
  @Output() menuToggle = new EventEmitter<void>();

  onMenuClick(): void {
    this.menuToggle.emit();
  }
}
