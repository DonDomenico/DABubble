import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
  imports: [MatIconModule, MatDialogClose, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrl: './edit-profile-dialog.component.scss',
})
export class EditProfileDialogComponent implements OnInit {
  authService = inject(AuthenticationService);
  edit = false;
  fb = inject(FormBuilder);
  user: User;
  emailInDatabase: boolean = false;

  editProfileForm = this.fb.group({
    username: '',
    email: ['', [Validators.email, this.emailAlreadyExists()]]
  })

  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: any }
  ) {
    this.user = data.user;
  }

  ngOnInit(): void { }

  async saveChanges() {
    const newUsername = this.editProfileForm.get('username')?.value !== "" ? this.editProfileForm.get('username')?.value : this.data.user.displayName;
    const newEmail = this.editProfileForm.get('email')?.value !== "" ? this.editProfileForm.get('email')?.value : this.data.user.email;

    await this.authService.updateUsernameInAuth(newUsername);
    await this.authService.updateEmailInAuth(newEmail);
    await this.updateUserInFirestore(newUsername, newEmail);
    this.dialogRef.close();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  async updateUserInFirestore(newUserName: string, newEmailAdress: string) {
    if(this.editProfileForm.get('username')?.value !== "" || this.editProfileForm.get('email')?.value !== "") {
      try {
        await this.userService.updateUser(this.user as User, newUserName, newEmailAdress);
        console.log('User profile saved successfully');
  
      } catch (error) {
        console.error('Error saving user profile: ', error);
      }
    }
  }

  async searchEmailInDatabase() {
    const emailFound = this.userService.users.filter(user => user.email == this.editProfileForm.get('email')?.value);
    if(emailFound.length != 0) {
      this.emailInDatabase = true;
    }
  }

  emailAlreadyExists(): ValidatorFn {
    return() : ValidationErrors | null => {
      const emailValid = this.authService.emailAlreadyExists == '';

      if(!emailValid) {
        this.authService.emailAlreadyExists = '';
      }
      return !emailValid ? {emailExists: true} : null;
    }
  }

  onInputChange() {
    this.emailInDatabase = false;
  }

  checkFormValidity() {
    return this.editProfileForm.get('email')?.value == '' && this.editProfileForm.get('username')?.value == '';
  }
}
