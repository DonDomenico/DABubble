import { Component, inject, Inject } from '@angular/core';
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
import { AuthenticationService } from '../../services/authentication.service';
import { EditProfileDialogComponent } from '../edit-profile-dialog/edit-profile-dialog.component';
import { ReauthenticateUserDialogComponent } from '../reauthenticate-user-dialog/reauthenticate-user-dialog.component';
import { ChannelService } from '../../services/channel.service';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-show-profile-dialog',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, MatDialogClose, MatButtonModule, RouterModule],
  templateUrl: './show-profile-dialog.component.html',
  styleUrl: './show-profile-dialog.component.scss',
})
export class ShowProfileDialogComponent {
  authService = inject(AuthenticationService);
  channelService = inject(ChannelService)
  userId: string = '';
  edit = false;
  user: User | undefined;
  userAuthenticated: boolean = false;
  // @Input() user!: User;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    public dialog: MatDialog,
    private router: Router
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
      }
    }
  }

  redirectToChat(uid: string) {
    this.router.navigate([`general-view/single-message/${uid}`]);
    this.dialog.closeAll();

  }

  editUserProfile() {
    this.edit = true;
    this.dialog.open(EditProfileDialogComponent, {
      data: {
        user: this.authService.currentUser
      }
    })
  }

  async deleteAccount() {
    const userId = this.authService.currentUser.uid;
    let lastLoginTime = this.authService.currentUser.metadata.lastLoginAt;
    let now = new Date().getTime();
    let needsReauth = (now - lastLoginTime) / 60000 > 3 ? true : false;

    if(needsReauth) {
      this.openReauthenticationDialog();
    } else {
      await this.channelService.removeUserFromChannels(userId);
      await this.authService.deleteAccount();
      this.dialog.closeAll();
      this.userService.setStatusInactive(userId);
      this.userService.setAccountInactive(userId);
    }
  }

  openReauthenticationDialog() {
    let dialogRef = this.dialog.open(ReauthenticateUserDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      this.userAuthenticated = await result;
      console.log(`Dialog result: ${this.userAuthenticated}`);
    });
  }
}
