import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-general-view',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './general-view.component.html',
  styleUrl: './general-view.component.scss'
})
export class GeneralViewComponent {

}
