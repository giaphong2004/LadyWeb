import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-user-profile-form',
  standalone: false,
  templateUrl: './user-profile-form.component.html',
  styleUrl: './user-profile-form.component.css'
})
export class UserProfileFormComponent {
  @Input() parentForm!: FormGroup;
  @Input() currentUser: any; // Nhận thông tin user để hiển thị tên, email

  @Input() isUploading = false;

  // Gửi sự kiện chứa file ảnh ra cho component cha xử lý
  @Output() fileSelected = new EventEmitter<Event>();

  onFileSelected(event: Event): void {
    this.fileSelected.emit(event);
  }
}
