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
          this.profileForm.addControl('title', this.fb.control((user as any).ExpertProfile?.title || ''));
          this.profileForm.addControl('bio', this.fb.control((user as any).ExpertProfile?.bio || ''));
          this.profileForm.addControl('qualifications', this.fb.control((user as any).ExpertProfile?.qualifications || ''));
        }

        // 3. Cập nhật giá trị cho toàn bộ form
        this.profileForm.patchValue({
          fullName: (user as any).fullName || (user as any).full_name,
          avatarUrl: (user as any).avatar_url || (user as any).avatarUrl,
          title: (user as any).ExpertProfile?.title,
          bio: (user as any).ExpertProfile?.bio,
          qualifications: (user as any).ExpertProfile?.qualifications,
        });
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
        this.http.get<{ token: string, signature: string, expire: number }>('http://localhost:3000/api/imagekit/auth')
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
    if (this.profileForm.invalid) {
      Swal.fire('Thông tin chưa hợp lệ', 'Vui lòng kiểm tra lại các trường đã nhập.', 'warning');
      return;
    }

    const profileData = this.profileForm.value;

    this.userService.updateProfile(profileData).subscribe({
      next: (response: any) => {
        if (this.authService.setCurrentUser) {
          this.authService.setCurrentUser(response.user);
        }
        Swal.fire('Thành công', 'Đã cập nhật hồ sơ.', 'success');
      },
      error: (error: any) => {
        console.error('Update profile error:', error);
        Swal.fire('Lỗi', 'Không thể cập nhật hồ sơ.', 'error');
      }
    });
  }
}

