import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import flatpickr from 'flatpickr'; // 👈 Bạn đã import flatpickr ở đây
import { Vietnamese } from 'flatpickr/dist/l10n/vn';
// ⛔ Vì đã import ở trên, bạn không cần dòng "declare" này nữa
// declare var flatpickr: any;

@Component({
  selector: 'app-tool-section',
  standalone: false,
  templateUrl: './tool-section.component.html',
  styleUrls: ['./tool-section.component.css']
})
export class ToolSectionComponent implements AfterViewInit {

  @ViewChild('datePickerInput') datePickerInput!: ElementRef;

  public cycleLength: number = 28;
  public periodDuration: number = 5;
  public results: any = null;

  private fpInstance: any; // Lưu trữ instance của flatpickr

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // 2. Thiết lập ngôn ngữ mặc định cho flatpickr
      flatpickr.localize(Vietnamese);
      // Khởi tạo flatpickr và gán vào fpInstance
      this.fpInstance = flatpickr(this.datePickerInput.nativeElement, {
        // dateFormat là các ký tự định dạng của riêng flatpickr
        dateFormat: "j F, Y",
        defaultDate: "today"

      });
    }
  }

  // Phương thức được gọi bởi các nút +/-
  updateValue(field: 'cycleLength' | 'periodDuration', amount: number): void {
    if (field === 'cycleLength' && this.cycleLength + amount >= 1) {
      this.cycleLength += amount;
    }
    if (field === 'periodDuration' && this.periodDuration + amount >= 1) {
      this.periodDuration += amount;
    }
  }

  // Phương thức được gọi bởi nút "Xem kết quả"
  calculate(): void {
    if (!this.fpInstance) return;

    // Lấy ngày đã chọn từ instance của flatpickr
    const lastPeriodDate = this.fpInstance.selectedDates[0];
    if (!lastPeriodDate) {
      alert("Vui lòng chọn ngày bắt đầu kỳ kinh cuối.");
      return;
    }

    // Phần logic tính toán của bạn đã đúng
    const cycleLength = this.cycleLength;
    const ovulationDayOffset = cycleLength - 14;
    const nextPeriodDate = new Date(lastPeriodDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
    const ovulationDate = new Date(lastPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() + ovulationDayOffset);
    const fertileWindowStart = new Date(ovulationDate);
    fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);
    const fertileWindowEnd = new Date(ovulationDate);

    this.results = {
      nextPeriodDate: this.formatDate(nextPeriodDate),
      fertileWindow: `${this.formatDate(fertileWindowStart)} - ${this.formatDate(fertileWindowEnd)}`,
      ovulationDate: this.formatDate(ovulationDate)
    };
  }

  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  }
}
