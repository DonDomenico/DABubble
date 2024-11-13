import { Component, inject, Input, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogClose,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/users.service';
import { User } from '../user.interface';
import { updateProfile } from '@angular/fire/auth';
@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [MatIconModule, MatDialogClose, CommonModule, FormsModule],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrl: './edit-profile-dialog.component.scss',
})
export class EditProfileDialogComponent implements OnInit {
  authService = inject(AuthenticationService);
  edit = false;
  newUserName: string = "";
  // @Input() user!: User;
  user: User;

  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {
    this.user = data.user;
  }

  ngOnInit(): void { }

  async saveChanges() {
    await this.updateUserInAuth();
    await this.updateUserInFirestore();
    this.dialogRef.close();
  }

  async updateUserInFirestore() {
    try {
      await this.userService.updateUser(this.user as User, this.newUserName);
      console.log('User profile saved successfully');
      
    } catch (error) {
      console.error('Error saving user profile: ', error);
    }
  }

  async updateUserInAuth() {
    if(this.authService.currentUser !== null) {
      updateProfile(this.authService.currentUser, {
        displayName: this.newUserName
      }).then(() => {
        console.log('Profile updated')
      }).catch((error) => {
        console.error(error)
      });
    }
  }
}
