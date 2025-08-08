import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-expert-category',
  standalone: false,
  templateUrl: './expert-category.component.html',
  styleUrl: './expert-category.component.css'
})
export class ExpertCategoryComponent {
  @Output() specialtySelected = new EventEmitter<string>();

  specialties = [
    { id: 'all', name: 'Tất cả chuyên gia', icon: 'fas fa-users' },
    { id: 'Bác sĩ khoa sản', name: 'Sản phụ khoa', icon: 'fas fa-baby' },
    { id: 'Bác sĩ tâm lí', name: 'Tâm lý học', icon: 'fas fa-brain' },
    { id: 'Bác sĩ chăm sóc da', name: 'Chăm sóc da', icon: 'fas fa-hand-sparkles' },
    { id: 'Bác sĩ tiêu hóa', name: 'tiêu hóa', icon: 'fas fa-heartbeat' },
    { id: 'Bác sĩ dinh dưỡng', name: 'Dinh dưỡng', icon: 'fas fa-apple-alt' }
  ];

  selectedSpecialty: string = 'all';

  onSpecialtyClick(specialtyId: string): void {
    this.selectedSpecialty = specialtyId;

    // Emit specialty ID hoặc empty string cho "all"
    const emitValue = specialtyId === 'all' ? '' : specialtyId;
    this.specialtySelected.emit(emitValue);
  }
}
