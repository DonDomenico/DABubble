import { Component, inject, Output, EventEmitter } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ChannelListComponent } from '../channel-list/channel-list.component';
import { UsersComponent } from '../users/users.component';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelDialogComponent } from '../channel-list/create-channel-dialog/create-channel-dialog.component';
import { GeneralViewComponent } from '../general-view/general-view.component';
import { ChannelService } from '../services/channel.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Channel } from '../interfaces/channel.interface';


@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterModule, CommonModule, MatIcon, MatSidenavModule, ChannelListComponent, UsersComponent, GeneralViewComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {

  @Output() toggleEvent = new EventEmitter<void>();
  readonly dialog = inject(MatDialog);

  isChannelListHidden = false;
  isMemberListHidden = false;

  channelName: string = '';
  channelDescription: string = '';

  constructor(private channelService: ChannelService) {}

  getChannelList(): Channel[] {
    return this.channelService.channels;
  }


  addChannelDialog() {
    this.dialog.open(CreateChannelDialogComponent);
  }

  openChannelList() {
    this.isChannelListHidden = !this.isChannelListHidden;
  }

  openMemberList() {
    this.isMemberListHidden = !this.isMemberListHidden;
  }


}
