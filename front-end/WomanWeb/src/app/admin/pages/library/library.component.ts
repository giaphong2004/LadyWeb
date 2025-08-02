import { Component } from '@angular/core';
import { PostService } from '../../../shared/services/post.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-library',
  standalone: false,
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent {
  // 1. Tạo một biến để quản lý trạng thái hiển thị
  isEditMode = false;
  posts: any[] = []; // Mảng để lưu danh sách bài viết
  selectedPost: any = null; // Post được chọn để edit

  constructor(private postService: PostService) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  // Hàm để tải danh sách bài viết từ service
  loadPosts(searchTerm: string = ''): void {
    this.postService.getPosts(searchTerm).subscribe({
      next: (data) => {
        this.posts = data;
        console.log('Posts loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load posts', err);
      }
    });
  }

  // --- THÊM HÀM MỚI ĐỂ XỬ LÝ EDIT ---
  handleEditPost(post: any): void {
    this.showEditView(post);
  }

  // --- THÊM HÀM MỚI ĐỂ XỬ LÝ XÓA ---
  handleDeletePost(post: any): void {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: `Bạn sẽ không thể hoàn tác hành động xóa bài viết "${post.title}"!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Vâng, xóa đi!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.postService.deletePost(post.id).subscribe({
          next: () => {
            Swal.fire('Đã xóa!', 'Bài viết đã được xóa.', 'success');
            this.loadPosts(); // Tải lại danh sách
          },
          error: (err) => Swal.fire('Lỗi!', 'Không thể xóa bài viết.', 'error')
        });
      }
    });
  }
  // 2. Hàm để chuyển sang chế độ chỉnh sửa
  showEditView(post?: any): void {
    this.selectedPost = post || null;
    this.isEditMode = true;
  }

  // 3. Hàm để quay lại danh sách
  showListView(): void {
    this.selectedPost = null;
    this.isEditMode = false;
    this.loadPosts(); // Tải lại danh sách bài viết mới nhất
  }
}
