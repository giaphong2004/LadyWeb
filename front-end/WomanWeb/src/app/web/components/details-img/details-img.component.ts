import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-details-img',
  standalone: false,
  templateUrl: './details-img.component.html',
  styleUrl: './details-img.component.css'
})
export class DetailsImgComponent {
  @Input() post: any;
}
