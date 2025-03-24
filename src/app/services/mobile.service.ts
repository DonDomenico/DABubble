import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MobileServiceService {
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
}
