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
  // @Input() user!: User;
  user: User;

  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {
    this.user = { ...data.user};

   
  }

  ngOnInit(): void {
   
  }

  async saveUserProfile() {
    try {
      await this.userService.updateUser(this.user as User);
      console.log('User profile saved successfully');
      this.dialogRef.close(this.user);
    } catch (error) {
      console.error('Error saving user profile: ', error);
    }
  }

  // async saveUserProfile() { await this.userService.updateUser(this.user);
  //   this.dialogRef.close(this.user); }
}
