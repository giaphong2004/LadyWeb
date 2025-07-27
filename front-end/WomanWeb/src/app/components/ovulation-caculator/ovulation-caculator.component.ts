import { Component, ElementRef, ViewChild, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import flatpickr from 'flatpickr';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ovulation-caculator',
  standalone: false,
  templateUrl: './ovulation-caculator.component.html',
  styleUrl: './ovulation-caculator.component.css'
})
export class OvulationCaculatorComponent implements AfterViewInit {

  @ViewChild('datePickerInput') datePickerInput!: ElementRef;

  public cycleLength: number = 28;
  // Object 'results' chỉ chứa các trường cần thiết
  public results: { ovulationDate: string, fertileWindow: string } | null = null;

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

  // Hàm xử lý cho các nút cộng/trừ
  adjustCycleLength(amount: number): void {
    const newValue = this.cycleLength + amount;
    if (newValue >= 20 && newValue <= 45) { // Giới hạn hợp lý
      this.cycleLength = newValue;
    }
  }

  // Hàm tính toán đã được tùy chỉnh
  calculate(): void {
    if (!this.fpInstance) return;

    const lastPeriodDate = this.fpInstance.selectedDates[0];
    if (!lastPeriodDate) {
      Swal.fire({
        title: 'Chưa chọn ngày!',
        text: 'Vui lòng chọn ngày bắt đầu kỳ kinh cuối của bạn.',
        icon: 'warning',
        confirmButtonText: 'Đã hiểu',
        confirmButtonColor: '#E94079' // Màu nút cho hợp với theme của bạn
      });
      return;
    }

    const ovulationDayOffset = this.cycleLength - 14;
    const ovulationDate = new Date(lastPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() + ovulationDayOffset);
    const fertileWindowStart = new Date(ovulationDate);
    fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);
    const fertileWindowEnd = new Date(ovulationDate);

    this.results = {
      ovulationDate: this.formatDate(ovulationDate),
      fertileWindow: `${this.formatDate(fertileWindowStart)} - ${this.formatDate(fertileWindowEnd)}`
    };
  }

  // Hàm định dạng ngày tháng riêng của component
  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  }
}
