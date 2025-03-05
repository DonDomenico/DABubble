import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MobileServiceService {
  mobileHeader: boolean = true;
  logoHeader: boolean = false;
  isMobile: boolean = false;
  constructor() { }


  checkMobile() {
    if (window.innerWidth < 1000) {
      this.isMobile = true;
    }
  }
  
  toggleMobileHeader() {
    this.checkMobile();
    if(this.isMobile) {
      this.mobileHeader = !this.mobileHeader;
      this.logoHeader = !this.logoHeader;
    }
  }
}
