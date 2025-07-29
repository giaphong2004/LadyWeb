import { Component, ElementRef, ViewChild } from '@angular/core';
import { Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import flatpickr from 'flatpickr';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pregnancy-caculator',
  standalone: false,
  templateUrl: './pregnancy-caculator.component.html',
  styleUrl: './pregnancy-caculator.component.css'
})
export class PregnancyCaculatorComponent {
  @ViewChild('datePickerInput') datePickerInput!: ElementRef;

  public results: { dueDate: string, gestationalAge: string } | null = null;

  // Thuộc tính để lưu trữ instance của flatpickr
  private fpInstance: flatpickr.Instance | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      flatpickr.localize(Vietnamese);

      this.fpInstance = flatpickr(this.datePickerInput.nativeElement, {
        dateFormat: "j F, Y",
        defaultDate: "today"
      }) as flatpickr.Instance;
    }
  }

  calculate(): void {
    if (!this.fpInstance) return;

    const lastPeriodDate = this.fpInstance.selectedDates[0];

    if (!lastPeriodDate) {
      Swal.fire({
        title: 'Chưa chọn ngày!',
        text: 'Vui lòng chọn ngày đầu tiên của kỳ kinh cuối.',
        icon: 'warning',
        confirmButtonText: 'Đã hiểu',
        confirmButtonColor: '#E94079'
      });
      return;
    }

    // --- Logic tính toán từ script của bạn ---
    const today = new Date();
    // Đặt lại giờ, phút, giây về 0 để so sánh ngày chính xác
    today.setHours(0, 0, 0, 0);
    if (lastPeriodDate > today) {
      Swal.fire({
        title: 'Ngày không hợp lệ!',
        text: 'Ngày kinh cuối không thể ở trong tương lai.',
        icon: 'error',
        confirmButtonText: 'Chọn lại',
        confirmButtonColor: '#E94079'
      });
      return;
    }

    // Tính ngày dự sinh (thêm 280 ngày)
    const dueDate = new Date(lastPeriodDate);
    dueDate.setDate(dueDate.getDate() + 280);

    // Tính tuổi thai
    const timeDiff = today.getTime() - lastPeriodDate.getTime();
    const daysPregnant = Math.floor(timeDiff / (1000 * 3600 * 24));
    const weeks = Math.floor(daysPregnant / 7);
    const days = daysPregnant % 7;
    const gestationalAge = `Bạn đã mang thai khoảng ${weeks} tuần và ${days} ngày.`;

    // Gán kết quả để hiển thị ra template
    this.results = {
      dueDate: this.formatDate(dueDate),
      gestationalAge: gestationalAge
    };
  }

  // Hàm định dạng ngày tháng
  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  }
}

