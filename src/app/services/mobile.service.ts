import { inject, Injectable } from '@angular/core';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root'
})
export class MobileServiceService {
  channelService = inject(ChannelService);
  mobileHeader: boolean = true;
  logoHeader: boolean = false;
  isMobile: boolean = false;
  searchHeader: boolean = false;
  hideSideNav: boolean = false;
  fullView: boolean = true;

  constructor() { }

  checkMobile() {
    if (window.innerWidth < 1000) {
      this.isMobile = true;
    }
  }
  
  toggleMobileHeader() {
    // this.checkMobile();
    if(this.isMobile) {
      this.mobileHeader = !this.mobileHeader;
      this.logoHeader = !this.logoHeader;
      this.searchHeader = !this.searchHeader;
    }
  }

  toggleSidenavMobile() {
    if (this.isMobile) {
      this.fullView = false;
      this.hideSideNav = true;
      this.toggleMobileHeader();
    }
  }

  toggleSearchResult() {
    
  }
}
