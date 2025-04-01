import { Component, ElementRef, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ThreadComponent } from '../thread/thread.component';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { SingleMessageComponent } from '../chat/single-message/single-message.component';
import { SingleChannelComponent } from '../channel-list/single-channel/single-channel.component';
import { ChannelListComponent } from '../channel-list/channel-list.component';
import { ChannelService } from '../services/channel.service';
import { SearchService } from '../services/search.service';
import { MobileServiceService } from '../services/mobile.service';

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
  searchService = inject(SearchService);
  mobileService = inject(MobileServiceService);
  isMobile: boolean = false;
  fullView = true;
  isMenuOpen: boolean = false;

  constructor(public router: Router, public channelService: ChannelService, private el: ElementRef) {}

  ngOnInit() {
    this.adjustScreenHeight();
  }

  adjustScreenHeight() {
    const element = this.el.nativeElement.querySelector('.mat-drawer-container');
    if (element && window.innerWidth < 1000) {
      element.style.height = `${window.innerHeight - 66}px`; // Setzt die Höhe des Elements auf die aktuelle Fensterhöhe
    } else if(element) {
      element.style.height = `${window.innerHeight - 120}px`;
    }
  }

  toggleSideNav() {
    this.mobileService.hideSideNav = !this.mobileService.hideSideNav;
  }

  navigateToChannelList() {
    this.router.navigate(['/general-view/channel-list']);
    if (this.mobileService.isMobile) {
      this.fullView = false;
      this.mobileService.hideSideNav = true;
      this.mobileService.toggleMobileHeader();
    }
  }

  showSidenavMobile() {
    if(this.isMobile) {
      this.fullView = false;
      this.mobileService.hideSideNav = false;
    }
  }
}