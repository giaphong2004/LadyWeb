import { Component } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-library-category',
  standalone: false,
  templateUrl: './library-category.component.html',
  styleUrl: './library-category.component.css'
})
export class LibraryCategoryComponent {
  @Input() tags: any[] | null = [];
  // Gửi sự kiện chứa slug của tag được chọn ra ngoài
  @Output() tagSelected = new EventEmitter<string>();

  activeTagSlug: string = ''; // Biến để theo dõi tag nào đang được chọn
  showAllCategories: boolean = false; // Toggle state for mobile

  selectTag(slug: string): void {
    this.activeTagSlug = slug;
    this.tagSelected.emit(slug);
  }

  toggleCategories(): void {
    this.showAllCategories = !this.showAllCategories;
  }
}
