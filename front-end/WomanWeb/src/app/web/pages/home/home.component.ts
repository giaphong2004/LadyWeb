import { Component } from '@angular/core';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor() { }

  ngOnInit(): void {
    // Kiem tra xem co co hieu "showWelcome" tu trang Login gui sang khong
    const shouldShowWelcome = localStorage.getItem('showWelcome');

    if (shouldShowWelcome === 'true') {
      // 1. Hien thong bao chao mung
      Swal.fire({
        icon: 'success',
        title: 'Đăng nhập thành công!',
        text: 'Chào mừng bạn đến với LadyHealth!',
        showConfirmButton: false,
        timer: 2000, // Tăng thời gian lên xíu cho người dùng kịp đọc
        timerProgressBar: true,
        heightAuto: false, // Vẫn giữ cái này để trang chủ không bị giật
        width: window.innerWidth < 600 ? '90%' : '32em'
      });

      // 2. QUAN TRỌNG: Xóa cờ ngay để F5 không bị hiện lại
      localStorage.removeItem('showWelcome');
    }
  }
}
