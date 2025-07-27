import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import flatpickr from 'flatpickr';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menstrual-caculator',
  standalone: false,
  templateUrl: './menstrual-caculator.component.html',
  styleUrl: './menstrual-caculator.component.css'
})
export class MenstrualCaculatorComponent implements AfterViewInit {

  // Sử dụng @ViewChild để lấy tham chiếu đến input từ template
  @ViewChild('menstrualDatePickerInput') datePickerInput!: ElementRef;

  // Thuộc tính để lưu trữ trạng thái
  public periodDuration: number = 5;
  public cycleLength: number = 28;

  // Dùng một object 'results' để chứa kết quả, giống như cách làm mới
  public results: { nextPeriodDate: string } | null = null;
  // Thuộc tính để lưu trữ instance của flatpickr
  private fpInstance: flatpickr.Instance | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit(): void {
    // Chỉ chạy code nếu đang ở môi trường trình duyệt
    if (isPlatformBrowser(this.platformId)) {
      flatpickr.localize(Vietnamese);

      this.fpInstance = flatpickr(this.datePickerInput.nativeElement, {
        dateFormat: "j F, Y",
        defaultDate: "today"
      }) as flatpickr.Instance;
    }
  }

  // Hàm xử lý cho các nút cộng/trừ
  adjustValue(field: 'period' | 'cycle', amount: number): void {
    if (field === 'period') {
      const newValue = this.periodDuration + amount;
      if (newValue >= 1 && newValue <= 10) {
        this.periodDuration = newValue;
      }
    } else if (field === 'cycle') {
      const newValue = this.cycleLength + amount;
      if (newValue >= 20 && newValue <= 45) {
        this.cycleLength = newValue;
      }
    }
  }

  // Hàm tính toán, chỉ tính kỳ kinh tiếp theo
  calculate(): void {
    console.log("Calculating next period...");
    if (!this.fpInstance) return;

    const lastPeriodDate = this.fpInstance.selectedDates[0];
    if (!lastPeriodDate) {
      // Bước 2: Thay thế lời gọi showModal bằng Swal.fire
      Swal.fire({
        title: 'Chưa chọn ngày!',
        text: 'Vui lòng chọn ngày bắt đầu kỳ kinh cuối của bạn.',
        icon: 'warning',
        confirmButtonText: 'Đã hiểu',
        confirmButtonColor: '#E94079' // Màu nút cho hợp với theme của bạn
      });
      return;
    }

    const nextPeriod = new Date(lastPeriodDate);
    nextPeriod.setDate(nextPeriod.getDate() + this.cycleLength);

    // Gán kết quả vào object 'results'
    this.results = {
      nextPeriodDate: this.formatDate(nextPeriod)
    };
  }

  // Hàm định dạng ngày tháng riêng của component
  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  }
}
