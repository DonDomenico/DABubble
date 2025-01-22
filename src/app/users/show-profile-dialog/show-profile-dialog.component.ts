import { Component, inject, Inject, OnInit, Input } from '@angular/core';
import {
  MatDialogModule,
  MatDialog,
  MatDialogClose,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/users.service';
import { User } from '../user.interface';
import { getDoc } from '@angular/fire/firestore';
import { AuthenticationService } from '../../services/authentication.service';
import { EditProfileDialogComponent } from '../edit-profile-dialog/edit-profile-dialog.component';
@Component({
  selector: 'app-show-profile-dialog',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, MatDialogClose, MatButtonModule],
  templateUrl: './show-profile-dialog.component.html',
  styleUrl: './show-profile-dialog.component.scss',
})
export class ShowProfileDialogComponent implements OnInit {
  authService = inject(AuthenticationService);
  userId: string = '';
  edit = false;
  user: User | undefined;
  // @Input() user!: User;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    public dialog: MatDialog
  ) {
    this.userId = data.uid;
  }

  async ngOnInit(): Promise<void> {
    await this.showSingleUser();
  }



  async showSingleUser() {
    if (this.userId) {
      const user = await this.userService.getSingleUser(this.userId);
      if (user) {
        this.user = user;
      } else {
        console.log('No such document!');
        this.authService.showCurrentUser();
      }
    }
  }

  editUserProfile() {
    this.edit = true;
    this.authService.showCurrentUser();
    this.dialog.open(EditProfileDialogComponent, {
      data: {
        user: this.authService.currentUser
      }
    })
  }
}
