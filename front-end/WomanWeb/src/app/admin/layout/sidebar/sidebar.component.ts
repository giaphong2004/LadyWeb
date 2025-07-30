import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  // Biến để theo dõi menu nào đang được active
  activeItem: string = 'Tổng quan';

  // Định nghĩa cấu trúc menu dưới dạng một mảng các đối tượng
  menuItems = [
    {
      name: 'Tổng quan',
      icon: 'fas fa-tachometer-alt',
      path: '/admin/dashboard' // Sử dụng routerLink cho điều hướng
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
        { name: 'Sức khỏe A-Z', path: '/admin/posts' },
        { name: 'Chuyên gia', path: '/admin/experts' }
      ]
    },
    {
      name: 'Công cụ',
      icon: 'fa-solid fa-wrench',
      path: '/admin/tools'
    }
  ];

  /**
   * Hàm được gọi khi người dùng click vào một mục menu.
   * @param item - Đối tượng menu item được click.
   */
  handleMenuItemClick(item: any): void {
    // Nếu mục được click có menu con, lật trạng thái open
    if (item.submenu) {
      item.open = !item.open;
    } else {
      // Nếu không có menu con, đặt nó làm mục active
      this.activeItem = item.name;
    }
  }
}
