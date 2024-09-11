import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ChatComponent } from '../chat/chat.component';
import { ThreadComponent } from '../thread/thread.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-general-view',
  standalone: true,
  imports: [MatIconModule, HeaderComponent, SidenavComponent, ThreadComponent, MatSidenavModule, ChatComponent],
  templateUrl: './general-view.component.html',
  styleUrl: './general-view.component.scss'
})
export class GeneralViewComponent {
  // showFiller = true;

}
