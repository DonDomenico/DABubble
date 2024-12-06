import { Component, inject, Output, EventEmitter } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';

import { UsersComponent } from '../users/users.component';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelDialogComponent } from '../channel-list/create-channel-dialog/create-channel-dialog.component';

import { ChannelService } from '../services/channel.service';
import { CommonModule } from '@angular/common';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { Channel } from '../interfaces/channel.interface';


@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterModule, CommonModule, MatIcon, MatSidenavModule, UsersComponent, RouterLinkActive],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {

  @Output() toggleEvent = new EventEmitter<void>();
  readonly dialog = inject(MatDialog);
  unsubscribeChannels;
  isChannelListHidden = false;
  isMemberListHidden = false;

  channelName: string = '';
  channelDescription: string = '';

  constructor(public channelService: ChannelService) {
    this.channelService.getChannels();
    this.unsubscribeChannels = this.channelService.subChannelList();
  }

  ngOnDestroy() {
    this.unsubscribeChannels();
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
