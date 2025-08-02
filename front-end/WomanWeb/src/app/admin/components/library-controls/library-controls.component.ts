import { Component } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-library-controls',
  standalone: false,
  templateUrl: './library-controls.component.html',
  styleUrl: './library-controls.component.css'
})
export class LibraryControlsComponent {
  // 1. Tạo một EventEmitter để gửi sự kiện ra ngoài
  @Output() addPostClick = new EventEmitter<void>();
  @Output() searchTermChange = new EventEmitter<string>();
  // 2. Hàm này sẽ được gọi khi nhấn nút
  onAddPost(): void {
    // 3. Phát sự kiện ra cho component cha
    this.addPostClick.emit();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTermChange.emit(input.value);
  }
}

