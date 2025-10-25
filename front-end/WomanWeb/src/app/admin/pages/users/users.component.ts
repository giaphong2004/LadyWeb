import { Component, ViewChild } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { UsersControlsComponent } from '../../components/users-controls/users-controls.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  users: any[] = []; // Mảng để lưu danh sách người dùng
  @ViewChild(UsersControlsComponent) userControls!: UsersControlsComponent;
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(searchTerm: string = ''): void {
    this.userService.getUsers(searchTerm).subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  handleEditUser(user: any): void {
    this.userControls.openModalForEdit(user);
  }

  handleDeleteUser(user: any): void {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: `Bạn sẽ không thể hoàn tác hành động xóa người dùng "${user.full_name}"!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Vâng, xóa đi!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            Swal.fire('Đã xóa!', 'Người dùng đã được xóa.', 'success');
            this.loadUsers(); // Tải lại danh sách
          },
          error: (err) => {
            Swal.fire('Lỗi!', 'Không thể xóa người dùng này.', 'error');
          }
        });
      }
    });
  }
}


