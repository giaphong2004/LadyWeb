import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  // Định nghĩa cấu trúc menu dưới dạng một mảng các đối tượng
  menuItems = [
    {
      name: 'Tổng quan',
      icon: 'fas fa-tachometer-alt',
      path: '/admin' // Sử dụng routerLink cho điều hướng
    },
    {
      name: 'Người dùng',
      icon: 'fas fa-users',
      path: '/admin/users'
    },
    {
      name: 'Nội dung',
      icon: 'fas fa-file-alt',
      open: false, // Thêm thuộc tính 'open' để quản lý trạng thái đóng/mở
      submenu: [
        { name: 'Sức khỏe A-Z', path: '/admin/library' },
        { name: 'Chuyên gia', path: '/admin/experts' }
      ]
    },
    {
      name: 'Công cụ',
      icon: 'fa-solid fa-wrench',
      path: '/admin/tools'
    }
  ];

  toggleSubmenu(item: any): void {
    if (item.submenu) {
      item.open = !item.open;
    }
  }
}
