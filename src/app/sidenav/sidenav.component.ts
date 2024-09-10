import { Component, inject } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ChannelListComponent } from '../channel-list/channel-list.component';
import { UsersComponent } from '../users/users.component';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelDialogComponent } from '../channel-list/create-channel-dialog/create-channel-dialog.component';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatIcon, MatSidenavModule, ChannelListComponent, UsersComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  readonly dialog = inject(MatDialog);
  addChannelDialog() {
    this.dialog.open(CreateChannelDialogComponent);
  }
}
