import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService, User } from '../../../shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';
import Swal from 'sweetalert2';
import ImageKit from 'imagekit-javascript';


@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup; // 👈 Chỉ dùng một FormGroup duy nhất
  imagekit: ImageKit;
  isUploading = false;

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    // 1. Khởi tạo form với các control chung
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      avatarUrl: [''],
    });

    // Khởi tạo ImageKit SDK
    this.imagekit = new ImageKit({
      publicKey: "public_Z4qukkw+EOSeTcSX856fgAW/ykE=",
      urlEndpoint: "https://ik.imagekit.io/giaphongdev"
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // 2. Nếu là expert, thêm các control của expert vào form
        if (this.isExpert) {
          console.log('Adding expert controls...');
          // Chỉ add control nếu chưa có
          if (!this.profileForm.get('title')) {
            this.profileForm.addControl('title', this.fb.control(user.ExpertProfile?.title || ''));
          }
          if (!this.profileForm.get('bio')) {
            this.profileForm.addControl('bio', this.fb.control(user.ExpertProfile?.bio || ''));
          }
          if (!this.profileForm.get('qualifications')) {
            this.profileForm.addControl('qualifications', this.fb.control(user.ExpertProfile?.qualifications || ''));
          }
        }

        // 3. Cập nhật giá trị cho toàn bộ form
        const formData = {
          fullName: user.full_name,
          avatarUrl: user.avatar_url || '',
          ...(this.isExpert && {
            title: user.ExpertProfile?.title || '',
            bio: user.ExpertProfile?.bio || '',
            qualifications: user.ExpertProfile?.qualifications || ''
          })
        };

        console.log('Patching form with data:', formData);
        this.profileForm.patchValue(formData);
        console.log('Form after patch:', this.profileForm.value);
      }
    });
  }

  get isExpert(): boolean {
    return this.currentUser?.role === 'expert';
  }

  async onFileSelected(event: any): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploading = true;
    try {
      // Gọi API để lấy authentication parameters
      const authParams = await firstValueFrom(
        this.http.get<{ token: string, signature: string, expire: number }>('https://woman-web-production.up.railway.app/api/imagekit/auth')
      );

      // Upload với authentication parameters
      const result = await this.imagekit.upload({
        file,
        fileName: `avatar_${this.currentUser?.id}_${Date.now()}`,
        folder: "/lady_app_avatars/",
        token: authParams.token,
        signature: authParams.signature,
        expire: authParams.expire,
      });

      this.profileForm.patchValue({ avatarUrl: result.url });
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire('Lỗi', 'Upload ảnh thất bại.', 'error');
    } finally {
      this.isUploading = false;
    }
  }

  // 4. Hàm Lưu thay đổi
  onSave(): void {
    console.log('=== DEBUG FORM BEFORE SAVE ===');
    console.log('Form valid:', this.profileForm.valid);
    console.log('Form errors:', this.profileForm.errors);
    console.log('All form controls:');
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      console.log(`  ${key}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors
      });
    });
    console.log('Raw form value:', this.profileForm.value);
    console.log('Current user role:', this.currentUser?.role);
    console.log('Is expert:', this.isExpert);

    if (this.profileForm.invalid) {
      Swal.fire('Thông tin chưa hợp lệ', 'Vui lòng kiểm tra lại các trường đã nhập.', 'warning');
      return;
    }

    const profileData = this.profileForm.value;

    this.userService.updateProfile(profileData).subscribe({
      next: (response: any) => {
        console.log('Update response:', response);
        // Cập nhật currentUser với data mới từ server
        this.authService.updateCurrentUser(response.user);
        Swal.fire('Thành công', 'Đã cập nhật hồ sơ.', 'success');
      },
      error: (error: any) => {
        console.error('Update profile error:', error);
        Swal.fire('Lỗi', 'Không thể cập nhật hồ sơ.', 'error');
      }
    });
  }
}

