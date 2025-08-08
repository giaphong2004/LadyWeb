import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-details-profile-title',
  standalone: false,
  templateUrl: './details-profile-title.component.html',
  styleUrl: './details-profile-title.component.css'
})
export class DetailsProfileTitleComponent {
  @Input() expert: any;

  getExpertName(): string {
    return this.expert?.full_name || 'Chuyên gia';
  }

  getExpertTitle(): string {
    return this.expert?.ExpertProfile?.title || 'Chuyên gia sức khỏe';
  }

  getExpertBio(): string {
    return this.expert?.ExpertProfile?.bio || 'Chưa có thông tin tiểu sử';
  }

  getExpertQualifications(): string {
    return this.expert?.ExpertProfile?.qualifications || 'Chưa có thông tin bằng cấp';
  }

  getExpertEmail(): string {
    return this.expert?.email || 'Chưa có email';
  }

  getCreatedDate(): string {
    if (this.expert?.created_at) {
      return new Date(this.expert.created_at).toLocaleDateString('vi-VN');
    }
    return 'Chưa có thông tin';
  }

  hasQualifications(): boolean {
    return this.expert?.ExpertProfile?.qualifications && 
           this.expert.ExpertProfile.qualifications.trim() !== '';
  }

  hasBio(): boolean {
    return this.expert?.ExpertProfile?.bio && 
           this.expert.ExpertProfile.bio.trim() !== '';
  }
}
