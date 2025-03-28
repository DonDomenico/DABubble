import { Component, EventEmitter, HostListener, inject, Input, Output, signal } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { AuthenticationService } from '../services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { ShowProfileDialogComponent } from '../users/show-profile-dialog/show-profile-dialog.component';
import { SearchService } from '../services/search.service';
import { FormsModule } from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MobileServiceService } from '../services/mobile.service';
import { ChannelService } from '../services/channel.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatInputModule, MatIconModule, MatMenuModule, FormsModule, MatAutocompleteModule, RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  authService = inject(AuthenticationService);
  searchService = inject(SearchService);
  mobileService = inject(MobileServiceService);
  channelService = inject (ChannelService);
  isMobile = false;
  @Input()  channelId!: string;
  @Output() showSidenav = new EventEmitter<boolean>();

  constructor(public dialog: MatDialog, public router: Router) {
  }

  ngOnInit() {
    this.checkMobile();
  }

  checkMobile() {
    if (window.innerWidth < 1000) {
      this.isMobile = true;
    }
  }


  showUserProfile() {
    const focusedElement = document.activeElement as HTMLElement; // Get the currently focused element
    focusedElement.blur(); // Remove focus from the element
    this.dialog.open(ShowProfileDialogComponent, {
      data: {
        user: this.authService.currentUser
      }
    })
  }

  emitToggleSidenav() {   
    // if (this.isMobile && this.router.url.startsWith(`/general-view/single-channel/${this.channelId}/thread/`)	)  {
    //   this.channelService.isThreadHidden = !this.channelService.isThreadHidden;
    //   this.channelService.hideSingleChannel = false;
    //   this.router.navigateByUrl(`/general-view/single-channel/${this.channelId}`);

    // } else {

      this.showSidenav.emit(true);
      this.mobileService.mobileHeader = !this.mobileService.mobileHeader;
      this.mobileService.logoHeader = !this.mobileService.logoHeader;
      this.mobileService.searchHeader = !this.mobileService.searchHeader;
      this.mobileService.hideSideNav = !this.mobileService.hideSideNav;
      this.router.navigateByUrl('/general-view');
      this.searchService.searchText = '';
    }
    // this.mobileService.hideSideNav = false;
  // }

  redirectHome() {
    window.location.reload();
  }
}
