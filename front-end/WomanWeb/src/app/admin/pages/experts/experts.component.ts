import { Component, OnInit, ViewChild } from '@angular/core';
import { ExpertService } from '../../../shared/services/expert.service';
import Swal from 'sweetalert2';
import { ExpertsHeaderComponent } from '../../components/experts-header/experts-header.component';

@Component({
  selector: 'app-experts',
  standalone: false,
  templateUrl: './experts.component.html',
  styleUrl: './experts.component.css'
})
export class ExpertsComponent implements OnInit {
  experts: any[] = []; // Mảng để lưu danh sách chuyên gia
  @ViewChild(ExpertsHeaderComponent) expertsHeader!: ExpertsHeaderComponent;
  constructor(private expertService: ExpertService) { }

  ngOnInit(): void {
    this.loadExperts();
  }

  loadExperts(): void {
    this.expertService.getExperts().subscribe({
      next: (data) => {
        this.experts = data;
        console.log('Experts loaded:', this.experts);
      },
      error: (err) => console.error('Failed to load experts', err)
    });
  }

  // --- THÊM HÀM MỚI ĐỂ XỬ LÝ XÓA ---
  handleDeleteExpert(expert: any): void {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: `Bạn sẽ không thể hoàn tác hành động xóa chuyên gia "${expert.full_name}"!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Vâng, xóa đi!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.expertService.deleteExpert(expert.id).subscribe({
          next: () => {
            Swal.fire('Đã xóa!', 'Chuyên gia đã được xóa.', 'success');
            // Tải lại danh sách để cập nhật giao diện
            this.loadExperts();
          },
          error: (err) => {
            Swal.fire('Lỗi!', 'Không thể xóa chuyên gia.', 'error');
            console.error(err);
          }
        });
      }
    });
  }

  handleEditExpert(expert: any): void {
    this.expertsHeader.openForEdit(expert);
  }
}
