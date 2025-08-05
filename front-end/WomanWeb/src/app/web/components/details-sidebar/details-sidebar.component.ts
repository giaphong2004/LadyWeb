import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-details-sidebar',
  standalone: false,
  templateUrl: './details-sidebar.component.html',
  styleUrl: './details-sidebar.component.css'
})
export class DetailsSidebarComponent {
  @Input() relatedPosts: any[] = [];
}
