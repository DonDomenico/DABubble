import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-reauthenticate-user-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reauthenticate-user-dialog.component.html',
  styleUrl: './reauthenticate-user-dialog.component.scss'
})
export class ReauthenticateUserDialogComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthenticationService);
  passwordVisible: boolean = false;

  reauthenticateForm = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, this.passwordMatchesEmail(), this.loginAttempts()]]
  })

  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<ReauthenticateUserDialogComponent>) {}

  async reauthenticateUser(email: string, password: string) {
    let userAuthenticated = await this.authService.reauthenticateUser(email, password);
    // show success message
    if(userAuthenticated === true) {
      this.dialogRef.close(true);
    }
  }

  passwordMatchesEmail(): ValidatorFn {
    return() : ValidationErrors | null => {
      const passwordValid = this.authService.passwordError == '';

      if(!passwordValid) {
        this.authService.passwordError = '';
      }
      return !passwordValid ? {passwordWrong: true} : null;
    }
  }

  loginAttempts(): ValidatorFn {
    return() : ValidationErrors | null => {
      const requestsValid = this.authService.tooManyRequests == '';

      if(!requestsValid) {
        this.authService.tooManyRequests = '';
      }

      return !requestsValid ? {tooManyAttempts: true} : null;
    }
  }

  togglePasswordVisibility() {
    if(this.passwordVisible == false) {
      this.passwordVisible = true;
    } else {
      this.passwordVisible = false;
    }
  }
}
