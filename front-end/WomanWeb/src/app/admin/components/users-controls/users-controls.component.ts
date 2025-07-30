import { Component } from '@angular/core';

@Component({
  selector: 'app-users-controls',
  standalone: false,
  templateUrl: './users-controls.component.html',
  styleUrl: './users-controls.component.css'
})
export class UsersControlsComponent {
  // Biến để kiểm soát trạng thái của modal
  public isModalOpen = false;

  // Hàm để mở modal
  openModal(): void {
    this.isModalOpen = true;
  }

  // Hàm để đóng modal
  closeModal(): void {
    this.isModalOpen = false;
  }
}
