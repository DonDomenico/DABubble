import { Component, inject, Output, EventEmitter } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { UsersComponent } from '../users/users.component';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelDialogComponent } from '../channel-list/create-channel-dialog/create-channel-dialog.component';
import { ChannelService } from '../services/channel.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLinkActive, RouterModule } from '@angular/router';
import { SearchService } from '../services/search.service';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MobileServiceService } from '../services/mobile.service';
import { onSnapshot, query, where } from '@angular/fire/firestore';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterModule, CommonModule, MatIcon, MatSidenavModule, UsersComponent, RouterLinkActive, FormsModule, MatAutocompleteModule,],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  @Output() toggleEvent = new EventEmitter<void>();
  mobileService = inject(MobileServiceService);
  authService = inject(AuthenticationService);
  selected!: boolean;
  readonly dialog = inject(MatDialog);
  unsubscribeChannels: any;
  unsubConversations: any;
  isChannelListHidden = false;
  isMemberListHidden = false;
  selectedChannelId: string = '';
  channelName: string = '';
  channelDescription: string = '';
  channelId: string = '';
  routeSubscription: any;
  mobileHeader: boolean = false;
  logoHeader: boolean = false;
  dataLoaded: boolean = false;

  constructor(public channelService: ChannelService, public searchService: SearchService, private route: ActivatedRoute) {
  }
  
  async ngOnInit() {
    await this.channelService.getChannels();
    this.dataLoaded = true;
    this.unsubscribeChannels = this.subChannelList();
    
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
    if(this.routeSubscription !== undefined) {
      this.routeSubscription.unsubscribe();
    }
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

  subChannelList() {
    const q = query(this.channelService.getChannelRef(), where('member', 'array-contains', this.authService.currentUser.uid));
    return onSnapshot(q, (channelList) => {
      this.channelService.channels = [];
      channelList.forEach((channel) => {
        console.log(this.channelService.toJsonChannel(channel.data(), channel.id)); // später löschen
        this.channelService.channels.push(this.channelService.toJsonChannel(channel.data(), channel.id));
      });
    });
  }
}
