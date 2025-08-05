import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-details-header',
  standalone: false,
  templateUrl: './details-header.component.html',
  styleUrl: './details-header.component.css'
})
export class DetailsHeaderComponent {
  @Input() post: any;
}
