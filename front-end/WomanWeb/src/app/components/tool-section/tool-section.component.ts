import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import flatpickr from 'flatpickr';
import { PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-tool-section',
  standalone: false, // Đây là giá trị mặc định, có thể bỏ qua
  templateUrl: './tool-section.component.html',
  styleUrls: ['./tool-section.component.css']
})
export class ToolSectionComponent implements AfterViewInit {

  // Lấy tham chiếu đến thẻ input ngày tháng từ file HTML
  @ViewChild('datePickerInput') datePickerInput!: ElementRef;

  // Các thuộc tính để lưu trữ dữ liệu và kết nối với HTML
  public cycleLength: number = 28;
  public periodDuration: number = 5;
  public results: any = null;

  private fpInstance: any;

  // 2. Inject PLATFORM_ID vào constructor để nhận biết môi trường
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit(): void {
    // 3. Chỉ chạy code flatpickr nếu đang ở trên trình duyệt
    if (isPlatformBrowser(this.platformId)) {
      this.fpInstance = flatpickr(this.datePickerInput.nativeElement, {
        dateFormat: "j F, Y",
        defaultDate: "today",
        locale: "vn"
      });
    }
  }

  // Phương thức được gọi bởi các nút +/- trong HTML
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
    const lastPeriodDate = this.fpInstance.selectedDates[0];
    if (!lastPeriodDate) {
      alert("Vui lòng chọn ngày bắt đầu kỳ kinh cuối.");
      return;
    }

    const cycleLength = this.cycleLength;
    const ovulationDayOffset = cycleLength - 14;
    const nextPeriodDate = new Date(lastPeriodDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
    const ovulationDate = new Date(lastPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() + ovulationDayOffset);
    const fertileWindowStart = new Date(ovulationDate);
    fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);
    const fertileWindowEnd = new Date(ovulationDate);

    // Gán kết quả để giao diện tự động cập nhật
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
