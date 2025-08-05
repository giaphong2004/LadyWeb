import { Component } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-library-section',
  standalone: false,
  templateUrl: './library-section.component.html',
  styleUrl: './library-section.component.css'
})
export class LibrarySectionComponent {
  // Gửi sự kiện chứa từ khóa tìm kiếm ra ngoài
  @Output() search = new EventEmitter<string>();

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    // (Tùy chọn: Thêm debounceTime để tối ưu)
    this.search.emit(input.value);
  }
}
