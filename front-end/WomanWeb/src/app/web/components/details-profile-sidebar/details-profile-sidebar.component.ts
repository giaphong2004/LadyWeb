import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-details-profile-sidebar',
  standalone: false,
  templateUrl: './details-profile-sidebar.component.html',
  styleUrl: './details-profile-sidebar.component.css'
})
export class DetailsProfileSidebarComponent {
  @Input() expert: any;

  getExpertName(): string {
    return this.expert?.full_name || 'Chuyên gia';
  }

  getExpertTitle(): string {
    return this.expert?.ExpertProfile?.title || 'Chuyên gia sức khỏe';
  }

  getExpertImage(): string {
    if (this.expert?.avatar_url) {
      return this.expert.avatar_url;
    }
    return '/assets/img/default-avatar.png';
  }

  getExpertEmail(): string {
    return this.expert?.email || 'Chưa có email';
  }

  getExpertStatus(): string {
    return this.expert?.ExpertProfile?.status || 'unknown';
  }

  isExpertVerified(): boolean {
    return this.expert?.ExpertProfile?.status === 'approved';
  }
}
