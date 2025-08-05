import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PublicService } from '../../../shared/services/public.service';


export interface PostQuery {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
}


@Component({
  selector: 'app-library',
  standalone: false,
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent implements OnInit {


  tags$: Observable<any[]>; // Observable để lấy danh sách tags
  posts: any[] = []; // Mảng để lưu danh sách bài viết

  constructor(private publicService: PublicService) {
    // Khởi tạo tags$
    this.tags$ = this.publicService.getTags().pipe(tap(tags => console.log('Tags loaded:', tags)));
  }

  ngOnInit(): void {
    // Tải các bài viết ban đầu (ví dụ: 9 bài viết nổi bật)
    this.loadPosts({ page: 1, limit: 9 });
  }

  // Hàm để tải bài viết dựa trên các điều kiện lọc
  loadPosts(query: PostQuery): void {
    this.publicService.getPosts(query).subscribe({
      next: (response) => {
        this.posts = response.posts;
        console.log('Posts loaded:', this.posts);
      },
      error: (err) => console.error('Failed to load posts', err)
    });
  }

  // Hàm được gọi khi người dùng nhấn vào một tag
  onTagSelected(tagSlug: string): void {
    const query: PostQuery = { tag: tagSlug };
    this.loadPosts(query);
  }

  // Hàm được gọi khi người dùng tìm kiếm
  onSearch(searchTerm: string): void {
    const query: PostQuery = { search: searchTerm };
    this.loadPosts(query);
  }
}
