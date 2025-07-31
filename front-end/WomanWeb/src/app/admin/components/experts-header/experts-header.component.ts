import { Component } from '@angular/core';

@Component({
  selector: 'app-experts-header',
  standalone: false,
  templateUrl: './experts-header.component.html',
  styleUrl: './experts-header.component.css'
})
export class ExpertsHeaderComponent {
  // Biến để kiểm soát việc hiển thị modal
  isModalVisible = false;

  // Hàm mở modal
  openModal(): void {
    this.isModalVisible = true;
  }

  // Hàm đóng modal
  closeModal(): void {
    this.isModalVisible = false;
  }

  // Hàm xử lý khi submit form (hiện tại chỉ đóng modal)
  onFormSubmit(): void {
    console.log('Form submitted!');
    // Thêm logic xử lý dữ liệu form tại đây
    this.closeModal();
  }
}
