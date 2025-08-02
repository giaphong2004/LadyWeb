import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-library-table',
  standalone: false,
  templateUrl: './library-table.component.html',
  styleUrl: './library-table.component.css'
})
export class LibraryTableComponent {
  @Input() posts: any[] = [];
  // --- THÊM SỰ KIỆN OUTPUT ---
  @Output() deleteRequest = new EventEmitter<any>();
  @Output() editRequest = new EventEmitter<any>();

  // THÊM MẢNG CÁC CLASS MÀU
  tagColors: string[] = ['tag-pink', 'tag-blue', 'tag-green', 'tag-orange', 'tag-purple', 'tag-teal'];

  // Hàm này nhận vào ID của tag và trả về một class màu tương ứng
  getTagColor(tagId: number): string {
    // Dùng ID của tag để tính toán, đảm bảo màu sắc luôn cố định
    const colorIndex = tagId % this.tagColors.length;
    return this.tagColors[colorIndex];
  }
}
