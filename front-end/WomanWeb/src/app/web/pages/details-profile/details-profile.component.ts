import { Component, OnInit } from '@angular/core';
import { PublicService } from '../../../shared/services/public.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details-profile',
  standalone: false,
  templateUrl: './details-profile.component.html',
  styleUrl: './details-profile.component.css'
})
export class DetailsProfileComponent implements OnInit {

  expert: any | null = null; // Biến để lưu thông tin chuyên gia

  constructor(
    private route: ActivatedRoute,
    private publicService: PublicService
  ) { }

  ngOnInit(): void {
    // Lấy 'id' từ URL
    const expertId = this.route.snapshot.paramMap.get('id');

    if (expertId) {
      this.publicService.getExpertById(+expertId).subscribe({
        next: (data) => {
          this.expert = data;
          console.log('Expert details loaded:', this.expert);
        },
        error: (err) => console.error('Failed to load expert details', err)
      });
    }
  }
}
