import { Component } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ChannelListComponent } from '../channel-list/channel-list.component';
import { UsersComponent } from '../users/users.component';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatSidenavModule, ChannelListComponent, UsersComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {

}
