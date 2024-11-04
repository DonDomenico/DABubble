import { Component, inject, signal } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { AuthenticationService } from '../services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { ShowProfileDialogComponent } from '../users/show-profile-dialog/show-profile-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatInputModule, MatIconModule, MatMenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  authService = inject(AuthenticationService);

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.authService.showCurrentUser();
  }

  showUserProfile() {
    this.dialog.open(ShowProfileDialogComponent, {
      data: {
        user: this.authService.currentUser
      }
    })
  }
}
