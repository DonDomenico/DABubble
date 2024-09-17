import { Component, inject, Output, EventEmitter } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ChannelListComponent } from '../channel-list/channel-list.component';
import { UsersComponent } from '../users/users.component';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelDialogComponent } from '../channel-list/create-channel-dialog/create-channel-dialog.component';
import { GeneralViewComponent } from '../general-view/general-view.component';
import { Channel } from '../channel-list/channel';


@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatIcon, MatSidenavModule, ChannelListComponent, UsersComponent, GeneralViewComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  readonly dialog = inject(MatDialog);
  isChannelListHidden = false;
  isMemberListHidden = false;

  channelModel: Channel = new Channel('', '');


  addChannelDialog() {
    this.dialog.open(CreateChannelDialogComponent);
  }

  openChannelList() {
    this.isChannelListHidden = !this.isChannelListHidden;
  }

  openMemberList() {
    this.isMemberListHidden = !this.isMemberListHidden;
  }

  @Output() toggleEvent = new EventEmitter<void>();

  toggleSection() {
    this.toggleEvent.emit();
  }
}
