import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ThreadComponent } from '../thread/thread.component';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
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
export class GeneralViewComponent implements OnInit {
  isMobile: boolean = false;
  hideSideNav: boolean = false;
  fullView = true;
  mobileHeaderEvent = new EventEmitter<boolean>();

  constructor(public router: Router, public channelService: ChannelService) {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkMobile();
      }
    });

  }

  ngOnInit() {
    this.checkMobile();
  }

  @HostListener('click', ['$event'])
  onResize(event: MouseEvent) {
    this.checkMobile();
  }

  checkMobile() {
    if (window.innerWidth < 767) {
      this.isMobile = true;
    }
  }


  toggleSideNav() {
    this.hideSideNav = !this.hideSideNav;
  }

  toggleSidenavMobile() {
    if (this.isMobile) {
      this.fullView = false;
      this.hideSideNav = true;
    }
  }

  navigateToChannelList() {
    this.router.navigate(['/general-view/channel-list']);
    if (this.isMobile) {
      this.fullView = false;
      this.hideSideNav = true;
    }
  }

  showSidenavMobile() {
    if(this.isMobile) {
      this.fullView = false;
      this.hideSideNav = false;
    }
    this.mobileHeaderEvent.emit(true);
  }

  navigateToDashboard() {
    this.router.navigateByUrl('/general-view');
  }

}
