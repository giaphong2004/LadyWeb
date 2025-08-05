import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicService } from '../../../shared/services/public.service';


@Component({
  selector: 'app-details',
  standalone: false,
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent implements OnInit {
  post: any | null = null;
  relatedPosts: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private publicService: PublicService
  ) { }

  ngOnInit(): void {
    // Lắng nghe sự thay đổi của 'slug' trên URL để tải lại dữ liệu khi cần
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadPost(slug);
      }
    });
  }

  loadPost(slug: string): void {
    this.publicService.getPostBySlug(slug).subscribe({
      next: (data) => {
        this.post = data;
        // Lấy bài viết liên quan sau khi đã có bài viết chính
        if (this.post.Tags && this.post.Tags.length > 0) {
          this.loadRelatedPosts(this.post.Tags[0].slug, this.post.id);
        }
      },
      error: (err) => console.error('Failed to load post', err)
    });
  }

  loadRelatedPosts(tagSlug: string, excludeId: number): void {
    const query = { tag: tagSlug, limit: 3, exclude: excludeId };
    this.publicService.getPosts(query).subscribe(response => {
      this.relatedPosts = response.posts;
    });
  }
}
