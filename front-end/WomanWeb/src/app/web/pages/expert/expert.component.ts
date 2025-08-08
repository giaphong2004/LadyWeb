import { Component, OnInit, } from '@angular/core';
import { PublicService, PostQuery } from '../../../shared/services/public.service';

@Component({
  selector: 'app-expert',
  standalone: false,
  templateUrl: './expert.component.html',
  styleUrl: './expert.component.css'
})
export class ExpertComponent implements OnInit {
  experts: any[] = []; // Mảng để lưu danh sách chuyên gia

  // Biến để lưu trữ các điều kiện lọc/tìm kiếm
  private currentQuery: PostQuery = { page: 1, limit: 9 };

  constructor(private publicService: PublicService) { }

  ngOnInit(): void {
    this.loadExperts();
  }

  loadExperts(): void {
    this.publicService.getExperts(this.currentQuery).subscribe({
      next: (response) => {
        console.log('✅ Dữ liệu chuyên gia nhận được:', response);

        // Kiểm tra cấu trúc response
        if (response.experts && Array.isArray(response.experts)) {
          this.experts = response.experts;
          console.log(`✅ Đã load ${this.experts.length} chuyên gia`);
        } else if (Array.isArray(response)) {
          this.experts = response;
          console.log(`✅ Đã load ${this.experts.length} chuyên gia`);
        } else {
          console.warn('⚠️ Cấu trúc dữ liệu không mong đợi:', response);
          this.experts = [];
        }
      },
      error: (err) => {
        console.error('❌ Lỗi khi tải chuyên gia:', err);
        this.experts = [];
      }
    });
  }

  // Hàm xử lý khi người dùng tìm kiếm
  onSearch(searchTerm: string): void {
    console.log('🔍 Tìm kiếm chuyên gia với từ khóa:', searchTerm);
    this.currentQuery.search = searchTerm;
    this.currentQuery.page = 1; // Reset về trang 1 khi search
    this.loadExperts();
  }

  // Hàm xử lý khi người dùng lọc theo chuyên khoa
  onSpecialtySelected(specialty: string): void {
    console.log('🏥 Lọc chuyên gia theo chuyên khoa:', specialty);
    this.currentQuery.tag = specialty; // Dùng lại 'tag' cho 'specialty'
    this.currentQuery.page = 1; // Reset về trang 1 khi filter
    this.loadExperts();
  }
}
