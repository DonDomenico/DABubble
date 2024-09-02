import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import {MatSidenavModule} from '@angular/material/sidenav';

@Component({
  selector: 'app-general-view',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, MatSidenavModule],
  templateUrl: './general-view.component.html',
  styleUrl: './general-view.component.scss'
})
export class GeneralViewComponent {


}
