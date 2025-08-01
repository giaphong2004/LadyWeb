import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-users-table',
  standalone: false,
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.css'
})
export class UsersTableComponent {
  @Input() users: any[] = [];
  @Output() editRequest = new EventEmitter<any>();
  @Output() deleteRequest = new EventEmitter<any>();
}
