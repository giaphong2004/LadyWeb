import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpertService } from '../../../shared/services/expert.service';
import Swal from 'sweetalert2';
import ImageKit from 'imagekit-javascript';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-experts-header',
  standalone: false,
  templateUrl: './experts-header.component.html',
  styleUrl: './experts-header.component.css'
})
export class ExpertsHeaderComponent {
  @Output() expertAdded = new EventEmitter<void>(); // Sự kiện để thông báo khi thêm chuyên gia thành công
  @Output() expertUpdated = new EventEmitter<void>();
  editingExpertId: number | null = null;
  // Biến để kiểm soát việc hiển thị modal
  isModalVisible = false;
  isPanelVisible = false; // Thêm biến kiểm soát hiển thị panel sửa chuyên gia
  expertForm: FormGroup;
  imagekit: ImageKit; // <-- 2. KHAI BÁO BIẾN IMAGEKIT
  isUploadingAvatar = false;

  constructor(
    private fb: FormBuilder,
    private expertService: ExpertService,
    private http: HttpClient // <-- 1. THÊM HttpClient
  ) {
    this.expertForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      title: ['', Validators.required],
      bio: [''],
      avatarUrl: [''] // Ảnh không bắt buộc
    });

    this.imagekit = new ImageKit({
      publicKey: "public_Z4qukkw+EOSeTcSX856fgAW/ykE=",
      urlEndpoint: "https://ik.imagekit.io/giaphongdev"
    });
  }
  // --- 4. HÀM XỬ LÝ KHI NGƯỜI DÙNG CHỌN FILE ---
  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploadingAvatar = true;

    try {
      // BƯỚC 1: Gọi API backend để lấy chữ ký xác thực
      const authApiUrl = 'http://localhost:3000/api/imagekit/auth';
      const authParams = await firstValueFrom(this.http.get<any>(authApiUrl));

      // BƯỚC 2: Dùng chữ ký để gọi hàm upload
      const result = await this.imagekit.upload({
        file: file,
        fileName: `expert_${Date.now()}`,
        folder: "/lady_app_avatars/",
        token: authParams.token,
        signature: authParams.signature,
        expire: authParams.expire,
      });

      // Nếu thành công, cập nhật form
      this.expertForm.patchValue({ avatarUrl: result.url });

    } catch (error) {
      console.error("Upload failed:", error);
      Swal.fire('Lỗi', 'Upload ảnh thất bại. Vui lòng thử lại.', 'error');
    } finally {
      // Luôn tắt trạng thái loading dù thành công hay thất bại
      this.isUploadingAvatar = false;
    }
  }

  openModal(): void {
    this.isModalVisible = true;
  }

  // THÊM HÀM MỚI ĐỂ MỞ FORM SỬA
  openForEdit(expert: any): void {
    this.editingExpertId = expert.id;
    this.expertForm.patchValue({
      email: expert.email, // Email không nên cho sửa, nhưng vẫn hiển thị
      fullName: expert.full_name,
      title: expert.ExpertProfile.title,
      bio: expert.ExpertProfile.bio,
      avatarUrl: expert.avatar_url
    });
    this.isPanelVisible = true;
    // Tùy chọn: vô hiệu hóa trường email khi sửa
    this.expertForm.get('email')?.disable();
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.expertForm.reset();
    this.editingExpertId = null; // Reset ID khi đóng
    this.expertForm.get('email')?.enable(); // Mở lại trường email
  }

  // Method để đóng panel sửa chuyên gia
  closeEditPanel(): void {
    this.isPanelVisible = false;
    this.expertForm.reset();
    this.editingExpertId = null; // Reset ID khi đóng
    this.expertForm.get('email')?.enable(); // Mở lại trường email
  }

  // CHỈ CÓ MỘT HÀM onFormSubmit DUY NHẤT VÀ ĐÚNG LOGIC
  onFormSubmit(): void {
    if (this.expertForm.invalid) { return; }

    const formData = this.expertForm.getRawValue(); // Dùng getRawValue để lấy cả trường email bị disable
    if (!formData.avatarUrl) {
      formData.avatarUrl = 'https://ik.imagekit.io/ikmedia/placeholder.png';
    }

    if (this.editingExpertId) {
      // --- LOGIC CẬP NHẬT ---
      this.expertService.updateExpert(this.editingExpertId, formData).subscribe({
        next: () => {
          this.closeEditPanel(); // Đóng modal sửa thay vì closeModal()
          Swal.fire({
            title: 'Thành công!',
            text: 'Thông tin chuyên gia đã được cập nhật.',
            icon: 'success',
            showConfirmButton: false, // Ẩn nút "OK"
            timer: 1000
          });

          this.expertUpdated.emit();
        },
        error: (err) => Swal.fire('Lỗi!', 'Không thể cập nhật.', 'error')
      });
    } else {
      // --- LOGIC THÊM MỚI (giữ nguyên) ---
      this.expertService.addExpert(formData).subscribe({
        next: () => {
          this.closeModal();
          Swal.fire({
            title: 'Thành công!',
            text: 'Đã thêm chuyên gia mới.',
            icon: 'success',
            showConfirmButton: false, // Ẩn nút "OK"
            timer: 1000
          });
          this.expertAdded.emit();
        },
        error: (err) => Swal.fire('Lỗi!', 'Không thể thêm mới.', 'error')
      });
    }
  }
}
