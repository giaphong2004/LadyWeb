import { Component, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import flatpickr from 'flatpickr';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pregnancy-test-caculator',
  standalone: false,
  templateUrl: './pregnancy-test-caculator.component.html',
  styleUrl: './pregnancy-test-caculator.component.css'
})
export class PregnancyTestCaculatorComponent {
  // Tạo ViewChild cho cả hai ô nhập ngày
  @ViewChild('periodDatePickerInput') periodDatePickerInput!: ElementRef;
  @ViewChild('conceptionDatePickerInput') conceptionDatePickerInput!: ElementRef;

  // Thuộc tính để quản lý trạng thái
  public activeTab: 'period' | 'conception' = 'period'; // Tab mặc định là 'period'
  public cycleLength: number = 28;
  public results: { reliableTestDate: string, earlyTestDate: string } | null = null;

  // Thuộc tính để lưu trữ các instance của flatpickr
  private periodFpInstance: flatpickr.Instance | null = null;
  private conceptionFpInstance: flatpickr.Instance | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      flatpickr.localize(Vietnamese);

      // Khởi tạo lịch cho tab "Ngày kinh cuối"
      this.periodFpInstance = flatpickr(this.periodDatePickerInput.nativeElement, {
        dateFormat: "j F, Y",
        defaultDate: "today"
      }) as flatpickr.Instance;

      // Khởi tạo lịch cho tab "Ngày rụng trứng"
      this.conceptionFpInstance = flatpickr(this.conceptionDatePickerInput.nativeElement, {
        dateFormat: "j F, Y",
        defaultDate: "today"
      }) as flatpickr.Instance;
    }
  }

  // Hàm để thay đổi tab đang hoạt động
  setActiveTab(tabName: 'period' | 'conception'): void {
    this.activeTab = tabName;
    this.results = null; // Xóa kết quả cũ khi chuyển tab
  }

  // Hàm xử lý cho các nút cộng/trừ
  adjustCycleLength(amount: number): void {
    const newValue = this.cycleLength + amount;
    if (newValue >= 20 && newValue <= 45) {
      this.cycleLength = newValue;
    }
  }

  // Hàm tính toán chính
  calculate(): void {
    let reliableTestDate: Date;
    let earlyTestDate: Date;

    // Kiểm tra xem tab nào đang hoạt động để thực hiện logic tương ứng
    if (this.activeTab === 'period') {
      const lastPeriodDate = this.periodFpInstance?.selectedDates[0];
      if (!lastPeriodDate) {
        Swal.fire({ title: 'Lỗi', text: 'Vui lòng chọn ngày đầu tiên của kỳ kinh cuối.', icon: 'warning' });
        return;
      }
      reliableTestDate = new Date(lastPeriodDate);
      reliableTestDate.setDate(reliableTestDate.getDate() + this.cycleLength);

      const ovulationOffset = this.cycleLength - 14;
      earlyTestDate = new Date(lastPeriodDate);
      earlyTestDate.setDate(earlyTestDate.getDate() + ovulationOffset + 10);

    } else { // activeTab === 'conception'
      const conceptionDate = this.conceptionFpInstance?.selectedDates[0];
      if (!conceptionDate) {
        Swal.fire({ title: 'Lỗi', text: 'Vui lòng chọn ngày rụng trứng (thụ thai).', icon: 'warning' });
        return;
      }
      reliableTestDate = new Date(conceptionDate);
      reliableTestDate.setDate(reliableTestDate.getDate() + 14);

      earlyTestDate = new Date(conceptionDate);
      earlyTestDate.setDate(earlyTestDate.getDate() + 10);
    }

    // Gán kết quả để hiển thị
    this.results = {
      reliableTestDate: `Từ ${this.formatDate(reliableTestDate)}`,
      earlyTestDate: `Từ ${this.formatDate(earlyTestDate)}`
    };
  }

  // Hàm định dạng ngày tháng
  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  }
}
