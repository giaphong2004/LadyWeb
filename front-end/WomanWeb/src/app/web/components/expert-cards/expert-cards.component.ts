import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-expert-cards',
  standalone: false,
  templateUrl: './expert-cards.component.html',
  styleUrl: './expert-cards.component.css'
})
export class ExpertCardsComponent implements OnChanges {
  @Input() experts: any[] = [];

  ngOnChanges() {
    console.log('👥 Expert Cards nhận được dữ liệu:', this.experts);
    if (this.experts.length > 0) {
      console.log('👤 Ví dụ chuyên gia đầu tiên:', this.experts[0]);
    }
  }

  getExpertImage(expert: any): string {
    // Debug log để xem cấu trúc dữ liệu
    console.log('🖼️ Expert image data:', expert);

    // Kiểm tra avatar_url từ API
    if (expert.avatar_url) {
      return expert.avatar_url;
    }

    if (expert.ExpertProfile?.avatar) {
      return expert.ExpertProfile.avatar;
    }

    if (expert.expertProfile?.avatar) {
      return expert.expertProfile.avatar;
    }

    if (expert.avatar) {
      return expert.avatar;
    }

    // Default avatar dựa trên gender hoặc random
    const defaultImages = [
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200',
      'https://images.unsplash.com/photo-1622253692010-333f2da60710?q=80&w=200',
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200',
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=200'
    ];
    const index = (expert.id || 0) % defaultImages.length;
    return defaultImages[index];
  }

  getExpertName(expert: any): string {
    return expert.full_name || expert.fullName || expert.name || 'Chuyên gia';
  }

  getExpertSpecialization(expert: any): string {
    // Kiểm tra title từ ExpertProfile
    if (expert.ExpertProfile?.title) {
      return expert.ExpertProfile.title;
    }

    if (expert.ExpertProfile?.specialization) {
      return expert.ExpertProfile.specialization;
    }

    if (expert.expertProfile?.specialization) {
      return expert.expertProfile.specialization;
    }

    if (expert.specialization) {
      return expert.specialization;
    }

    // Dựa trên role để tạo specialization mặc định
    if (expert.role === 'expert') {
      return 'Chuyên gia sức khỏe';
    }

    return 'Chuyên gia tư vấn';
  }

  getExpertBio(expert: any): string {
    if (expert.ExpertProfile?.bio) {
      return expert.ExpertProfile.bio;
    }

    if (expert.expertProfile?.bio) {
      return expert.expertProfile.bio;
    }

    if (expert.bio) {
      return expert.bio;
    }

    return 'Chưa có thông tin tiểu sử';
  }

  getExpertQualifications(expert: any): string {
    if (expert.ExpertProfile?.qualifications) {
      return expert.ExpertProfile.qualifications;
    }

    if (expert.expertProfile?.qualifications) {
      return expert.expertProfile.qualifications;
    }

    if (expert.qualifications) {
      return expert.qualifications;
    }

    return '';
  }
}
