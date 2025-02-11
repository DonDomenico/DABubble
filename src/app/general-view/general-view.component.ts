import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ThreadComponent } from '../thread/thread.component';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SingleMessageComponent } from '../chat/single-message/single-message.component';
import { SingleChannelComponent } from '../channel-list/single-channel/single-channel.component';
import { ChannelListComponent } from '../channel-list/channel-list.component';
import { ChannelService } from '../services/channel.service';

@Component({
  selector: 'app-general-view',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    HeaderComponent,
    SidenavComponent,
    ThreadComponent,
    MatSidenavModule,
    ChannelListComponent,
    SingleMessageComponent,
    SingleChannelComponent,
  ],
  templateUrl: './general-view.component.html',
  styleUrl: './general-view.component.scss',
})
export class GeneralViewComponent {
  isMobile: boolean = false;
  hideSideNav: boolean = false;

  constructor(public router: Router, public channelService: ChannelService) {
    
  }  

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    event.target.innerWidth < 768 ? this.isMobile = true : this.isMobile = false;
  }


  onMobile(event: MouseEvent) {
    if(this.isMobile && this.router.url.startsWith('/general-view/single-message')) {
  this.hideSideNav = true;
    }
  }

}
