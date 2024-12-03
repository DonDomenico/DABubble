import { Component } from '@angular/core';
import { ChooseProfileImageComponent } from '../../signup/choose-profile-image/choose-profile-image.component';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { AvatarsService } from '../../services/avatars.service';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/users.service';

@Component({
  selector: 'app-edit-avatar-dialog',
  standalone: true,
  imports: [MatCard, MatCardTitle, MatCardContent],
  templateUrl: './edit-avatar-dialog.component.html',
  styleUrl: './edit-avatar-dialog.component.scss'
})
export class EditAvatarDialogComponent {

  constructor(public avatarService: AvatarsService, public dialogRef: MatDialogRef<EditAvatarDialogComponent>, private authService: AuthenticationService, private userService: UserService) {}

  changeAvatar() {
    this.authService.updateAvatar(this.avatarService.profileImg);
    this.userService.updateUserAvatar(this.authService.currentUser, this.avatarService.profileImg);
    this.dialogRef.close();
  }
}
