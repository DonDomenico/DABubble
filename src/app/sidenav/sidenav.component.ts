import { Component, inject, Output, EventEmitter, Input } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';

import { UsersComponent } from '../users/users.component';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelDialogComponent } from '../channel-list/create-channel-dialog/create-channel-dialog.component';

import { ChannelService } from '../services/channel.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLinkActive, RouterModule } from '@angular/router';
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
selected!: boolean;
  readonly dialog = inject(MatDialog);
  unsubscribeChannels;
  isChannelListHidden = false;
  isMemberListHidden = false;
  selectedChannelId: string = '';
  channelName: string = '';
  channelDescription: string = '';
  channelId: string = '';
  routeSubscription: any;

  constructor(public channelService: ChannelService, private route: ActivatedRoute) {
    this.channelService.getChannels();
    this.unsubscribeChannels = this.channelService.subChannelList();
  }

  ngOnChanges(): void {
    this.routeSubscription = this.route.children[0].params.subscribe(params => {
      this.selectedChannelId = params['id'];
      if(this.selectedChannelId! === this.channelService.channelId) {
        this.selected = true;
      } else {
        this.selected = false;
      }
    })
  }

  ngOnDestroy() {
    this.unsubscribeChannels();
    this.routeSubscription.unsubscribe();
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
