import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-details-description',
  standalone: false,
  templateUrl: './details-description.component.html',
  styleUrl: './details-description.component.css'
})
export class DetailsDescriptionComponent {
  @Input() post: any;
}
