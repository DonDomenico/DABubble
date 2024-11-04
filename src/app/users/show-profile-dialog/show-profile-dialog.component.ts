import { Component, Inject } from '@angular/core';
import {MatDialogModule,  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
  MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { User } from '../user.interface';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-show-profile-dialog',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
  templateUrl: './show-profile-dialog.component.html',
  styleUrl: './show-profile-dialog.component.scss'
})
export class ShowProfileDialogComponent {
  user!: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {user: any}, private authService: AuthenticationService) {}

  ngOnInit() {
    this.user = this.data.user;
  }

  isOwnProfile() {
    if(this.data.user.uid === this.authService.currentUser?.uid) {
      return true;
    } else {
      return false;
    }
  }
}
