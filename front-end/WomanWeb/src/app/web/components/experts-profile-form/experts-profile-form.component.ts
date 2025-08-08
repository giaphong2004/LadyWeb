import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-experts-profile-form',
  standalone: false,
  templateUrl: './experts-profile-form.component.html',
  styleUrl: './experts-profile-form.component.css'
})
export class ExpertsProfileFormComponent {
  @Input() parentForm!: FormGroup;
  //Nhận thông tin để hiện profile expert
}
