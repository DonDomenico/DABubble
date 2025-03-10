import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { AvatarsService } from '../../services/avatars.service';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/users.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-edit-avatar-dialog',
  standalone: true,
  imports: [MatCard, MatCardTitle, MatCardContent, MatIcon, MatDialogClose],
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

  onCancel() {
    this.dialogRef.close();
  }
}
