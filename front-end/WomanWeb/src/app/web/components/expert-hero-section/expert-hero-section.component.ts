import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-expert-hero-section',
  standalone: false,
  templateUrl: './expert-hero-section.component.html',
  styleUrl: './expert-hero-section.component.css'
})
export class ExpertHeroSectionComponent {
  @Output() search = new EventEmitter<string>();

  searchTerm: string = '';

  onSearchSubmit(): void {
    if (this.searchTerm.trim()) {
      this.search.emit(this.searchTerm.trim());
    }
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    
    // Tìm kiếm realtime khi người dùng gõ
    if (this.searchTerm.length >= 3 || this.searchTerm.length === 0) {
      this.search.emit(this.searchTerm);
    }
  }
}
