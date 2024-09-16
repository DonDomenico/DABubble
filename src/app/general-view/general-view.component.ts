import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ChatComponent } from '../chat/chat.component';
import { ThreadComponent } from '../thread/thread.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-general-view',
  standalone: true,
  imports: [CommonModule, MatIconModule, HeaderComponent, SidenavComponent, ThreadComponent, MatSidenavModule, ChatComponent],
  templateUrl: './general-view.component.html',
  styleUrl: './general-view.component.scss'
})
export class GeneralViewComponent {
  isSectionHidden = false;
generalView: any;

 ngOnInit() {
  
 }
  // toggleSection() {
  //   this.isSectionHidden = !this.isSectionHidden;
  // }

}
