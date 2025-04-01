import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
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
import { Router, RouterLink } from '@angular/router';
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
  isUserSearch: boolean = false;

  constructor(public dialog: MatDialog, public router: Router) {}

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

  onKeyUp(event: KeyboardEvent): void { 
    const input = (event.target as HTMLInputElement).value; 
    if (input.startsWith('@')) { 
      this.isUserSearch = true;
     } else if (input.startsWith('#')) { 
      this.isUserSearch = false;
     } else {
      this.isUserSearch = false;
     }
     this.searchService.searchUsersAndChannels();

   } 

  emitToggleSidenav() {   
      this.showSidenav.emit(true);
      this.mobileService.mobileHeader = !this.mobileService.mobileHeader;
      this.mobileService.logoHeader = !this.mobileService.logoHeader;
      this.mobileService.searchHeader = !this.mobileService.searchHeader;
      this.mobileService.hideSideNav = !this.mobileService.hideSideNav;
      this.router.navigateByUrl('/general-view');
      this.searchService.searchText = '';
    }

  redirectHome() {
    window.location.reload();
  }
}
