import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../../../shared/services/post.service'; // Chỉnh lại đường dẫn nếu cần
import Swal from 'sweetalert2';
import ImageKit from 'imagekit-javascript';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs'; // Thêm Observable

@Component({
  selector: 'app-library-edit',
  templateUrl: './library-edit.component.html',
  styleUrls: ['./library-edit.component.css'],
  standalone: false // Nếu bạn đang sử dụng Angular standalone components
})
export class LibraryEditComponent implements OnInit {
  @Input() post: any | null = null;
  @Output() backToList = new EventEmitter<void>();

  postForm: FormGroup;
  imagekit: ImageKit;
  isUploading = false;
  allTags: any[] = [];

  // Fallback tags nếu API không hoạt động
  private fallbackTags = [
    { id: 1, name: 'chu kỳ của bạn' },
    { id: 2, name: 'sức khỏe 360' },
    { id: 3, name: 'đang mang thai' },
    { id: 4, name: 'mang thai' },
    { id: 5, name: 'làm mẹ' }
  ];

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private http: HttpClient
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      cover_image_url: [''],
      status: ['draft', Validators.required],
      tags: [[]]
    });

    // Sử dụng ImageKit config thực tế
    this.imagekit = new ImageKit({
      publicKey: "public_Z4qukkw+EOSeTcSX856fgAW/ykE=",
      urlEndpoint: "https://ik.imagekit.io/giaphongdev"
    });
  }

  ngOnInit(): void {
    // Load tags first
    this.loadTags();

    if (this.post) {
      console.log('� Editing post:', this.post);
      this.populateForm(this.post);
    } else {
      console.log('➕ Creating new post');
      // Reset form for new post
      this.postForm.reset({
        title: '',
        content: '',
        cover_image_url: '',
        status: 'draft',
        tags: []
      });
    }
  }

  private populateForm(post: any): void {
    console.log('� Populating form with:', {
      title: post.title,
      content: post.content ? `${post.content.substring(0, 50)}...` : 'NO CONTENT',
      status: post.status,
      tags: post.Tags?.length || 0
    });

    this.postForm.patchValue({
      title: post.title || '',
      content: post.content || '',
      cover_image_url: post.cover_image_url || '',
      status: post.status || 'draft',
      tags: post.Tags?.map((tag: any) => tag.id) || []
    });
  }

  // Load tags từ API hoặc sử dụng fallback
  private loadTags(): void {
    // Tạm thời dùng fallback tags
    // Sau này có thể thêm API call: this.tagService.getTags()
    this.allTags = this.fallbackTags;
  }

  // Upload ảnh bìa
  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire('Lỗi', 'Vui lòng chọn file ảnh.', 'error');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Lỗi', 'Kích thước file không được vượt quá 5MB.', 'error');
      return;
    }

    this.isUploading = true;
    try {
      const authParams = await firstValueFrom(this.http.get<any>('https://ladyweb-api.onrender.com/api/imagekit/auth'));

      const result = await this.imagekit.upload({
        file: file,
        fileName: `post_cover_${Date.now()}_${file.name}`,
        folder: "/lady_app_covers/",
        token: authParams.token,
        signature: authParams.signature,
        expire: authParams.expire,
      });

      this.postForm.patchValue({ cover_image_url: result.url });
      Swal.fire('Thành công!', 'Đã tải lên ảnh bìa.', 'success');
    } catch (error: any) {
      Swal.fire('Lỗi', `Upload ảnh thất bại: ${error.message || 'Lỗi không xác định'}`, 'error');
    } finally {
      this.isUploading = false;
    }
  }

  onBackToList(): void {
    this.backToList.emit();
  }

  onSave(status: 'draft' | 'published'): void {
    if (this.postForm.invalid) {
      Swal.fire('Lỗi', 'Vui lòng điền đầy đủ tiêu đề và nội dung.', 'error');
      return;
    }

    // Tạo form data với status được cập nhật
    const formData = {
      ...this.postForm.value,
      status: status
    };

    let saveObservable: Observable<any>;

    if (this.post) {
      saveObservable = this.postService.updatePost(this.post.id, formData);
    } else {
      saveObservable = this.postService.createPost(formData);
    }

    saveObservable.subscribe({
      next: (response) => {
        const action = this.post ? 'cập nhật' : 'tạo';
        Swal.fire('Thành công!', `Đã ${action} bài viết.`, 'success');
        this.backToList.emit();
      },
      error: (err) => {
        console.error('Save error:', err);
        const action = this.post ? 'cập nhật' : 'tạo';
        Swal.fire('Lỗi!', `Không thể ${action} bài viết: ${err.error?.message || err.message}`, 'error');
      }
    });
  }
}
