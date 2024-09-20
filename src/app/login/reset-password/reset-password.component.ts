import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, Validators, ReactiveFormsModule, FormBuilder, ValidatorFn, ValidationErrors } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [MatCardModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthenticationService);
  router = inject(Router);
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(private _snackBar: MatSnackBar) { }

  resetPasswordForm = this.fb.nonNullable.group({
    password: ['', Validators.required],
    passwordConfirm: ['', Validators.required]
  });

  showSnackBar() {
    this._snackBar.openFromComponent(SnackbarComponentResetPassword, {
      duration: 1800,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: 'snackbar'
    });
  }

  submit() {
    this.showSnackBar();
    setTimeout(() => {
      this.router.navigateByUrl('/');
    }, 2000);
  }

  disableSubmitButton() {
    return this.resetPasswordForm.get('password')?.value != this.resetPasswordForm.get('passwordConfirm')?.value ||
    this.resetPasswordForm.get('password')?.value == '' ||
    this.resetPasswordForm.get('passwordConfirm')?.value == '';
  }
}

@Component({
  selector: 'snack-bar-reset-password',
  template: `
      <span>Anmelden</span>
  `,
  standalone: true,
})
export class SnackbarComponentResetPassword { }
