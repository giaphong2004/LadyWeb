import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users-controls',
  standalone: false,
  templateUrl: './users-controls.component.html',
  styleUrl: './users-controls.component.css'
})
export class UsersControlsComponent {
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() userAdded = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<void>();
  // Biến để kiểm soát trạng thái của modal
  public isModalOpen = false;
  userForm: FormGroup;
  editingUserId: number | null = null;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', Validators.required] // Thêm role vào form
    });
  }

  // Hàm để mở modal
  openModal(): void {
    this.editingUserId = null;
    this.userForm.reset({ role: 'user' }); // Reset form cho người dùng mới
    this.userForm.get('email')?.enable();
    this.isModalOpen = true;
  }

  // Hàm để đóng modal
  closeModal(): void {
    this.isModalOpen = false;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTermChange.emit(input.value);
  }

  openModalForEdit(user: any): void {
    this.editingUserId = user.id;
    this.userForm.patchValue({
      fullName: user.full_name,
      email: user.email,
      role: user.role
    });
    this.userForm.get('email')?.disable(); // Không cho sửa email
    this.isModalOpen = true;
  }

  onFormSubmit(): void {
    if (this.userForm.invalid) { return; }

    const formData = this.userForm.getRawValue();

    if (this.editingUserId) {
      this.userService.updateUser(this.editingUserId, formData).subscribe({
        next: () => {
          this.closeModal();
          Swal.fire('Thành công', 'Đã cập nhật người dùng', 'success');
          this.userUpdated.emit();
        },
        error: (err) => Swal.fire('Lỗi', err.error.message, 'error')
      });
    } else {
      this.userService.createUser(formData).subscribe({
        next: () => {
          this.closeModal();
          Swal.fire('Thành công', 'Đã thêm người dùng và gửi email mời.', 'success');
          this.userAdded.emit();
        },
        error: (err) => Swal.fire('Lỗi', err.error.message, 'error')
      });
    }
  }
}

