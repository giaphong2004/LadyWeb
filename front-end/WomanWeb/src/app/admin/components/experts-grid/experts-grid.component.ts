import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-experts-grid',
  standalone: false,
  templateUrl: './experts-grid.component.html',
  styleUrl: './experts-grid.component.css'
})
export class ExpertsGridComponent {
  @Input() experts: any[] = [];
  @Output() deleteRequest = new EventEmitter<any>();
  @Output() editRequest = new EventEmitter<any>(); // Gửi yêu cầu sửa

  // THÊM HÀM NÀY ĐỂ KIỂM TRA
  onEditClick(expert: any): void {
    console.log('1. Clicked Edit on:', expert.full_name); // Kiểm tra xem click có được ghi nhận không
    this.editRequest.emit(expert);
  }
}
