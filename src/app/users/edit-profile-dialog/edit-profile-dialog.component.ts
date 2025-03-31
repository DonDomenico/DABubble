import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogClose,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/users.service';
import { User } from '../user.interface';
import { ReauthenticateUserDialogComponent } from '../reauthenticate-user-dialog/reauthenticate-user-dialog.component';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { EditAvatarDialogComponent } from '../edit-avatar-dialog/edit-avatar-dialog.component';

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [MatIconModule, MatDialogClose, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrl: './edit-profile-dialog.component.scss',
})
export class EditProfileDialogComponent {
  authService = inject(AuthenticationService);
  edit = false;
  fb = inject(FormBuilder);
  user: User;
  emailInDatabase: boolean = false;
  userAuthenticated: boolean = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  editProfileForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email, this.emailAlreadyExists()]]
  })

  constructor(
    private _snackbar: MatSnackBar,
    private userService: UserService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: any }
  ) {
    this.user = data.user;
  }

  async saveChanges() {
    const newUsername = this.editProfileForm.get('username')?.value !== "" ? this.editProfileForm.get('username')?.value : this.data.user.displayName;
    const newEmail = this.editProfileForm.get('email')?.value !== "" ? this.editProfileForm.get('email')?.value : this.data.user.email;

    if(newUsername !== this.data.user.displayName) {
      await this.authService.updateUsernameInAuth(newUsername);
      await this.updateUsernameInFirestore(newUsername);
    }

    if(newEmail !== this.data.user.email) {
      this.openReauthenticationDialog(newEmail);
    }
    this.closeDialog();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  async updateUsernameInFirestore(newUserName: string) {
    if(this.editProfileForm.get('username')?.value !== "" || this.editProfileForm.get('email')?.value !== "") {
      try {
        await this.userService.updateUsername(this.user as User, newUserName);
        console.log('User profile saved successfully');
  
      } catch (error) {
        console.error('Error saving user profile: ', error);
      }
    }
  }

  async updateUserEmailInFirestore(newEmail: string) {
    if(this.editProfileForm.get('username')?.value !== "" || this.editProfileForm.get('email')?.value !== "") {
      try {
        await this.userService.updateUserEmail(this.user as User, newEmail);
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

  async openReauthenticationDialog(newEmail: string) {
    let dialogRef = this.dialog.open(ReauthenticateUserDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      this.userAuthenticated = await result;
      console.log(`Dialog result: ${this.userAuthenticated}`);

      if(this.userAuthenticated === true) {
        await this.authService.updateEmailAddress(newEmail);
        this.showSnackBar();
        // await this.authService.logoutAfterChangingEmail(this.data.user.email);
        if(this.authService.emailChanged === true) {
          this.updateUserEmailInFirestore(newEmail); // should only be called, if the verification-link was clicked
        }
        // check if user has clicked on the verification link and log him out automatically
        // this.authService.currentUser?.reload();
      }
    });
  }

  showAvatarOptions() {
    this.dialog.open(EditAvatarDialogComponent);
  }

  showSnackBar() {
    this._snackbar.open('Wir haben Ihnen eine E-Mail an Ihre neue E-Mail-Adresse gesendet. Bitte klicken Sie dort auf den Link, um die Änderung zu bestätigen.', 'OK', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: 'snackbar',
    });
  }
}
