import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-library-cards',
  standalone: false,
  templateUrl: './library-cards.component.html',
  styleUrl: './library-cards.component.css'
})
export class LibraryCardsComponent {
  @Input() posts: any[] = [];
}
