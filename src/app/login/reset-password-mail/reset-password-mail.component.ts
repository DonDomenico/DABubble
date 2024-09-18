import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { FormsModule, Validators, ReactiveFormsModule, FormBuilder, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password-mail',
  standalone: true,
  imports: [MatCardModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './reset-password-mail.component.html',
  styleUrl: './reset-password-mail.component.scss'
})
export class ResetPasswordMailComponent {
  authService = inject(AuthenticationService);
  router = inject(Router);
  fb = inject(FormBuilder);
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(private _snackBar: MatSnackBar) { }

  sendMailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email, this.noAccountWithEmail()]]
  })

  async submit(email: string) {
    await this.authService.sendMailResetPassword(email);
    if(this.authService.noAccountWithEmail == '') {
      this.showSnackBar();
    }
  }

  showSnackBar() {
    this._snackBar.openFromComponent(SnackbarComponentEmailSent, {
      duration: 2000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: 'snackbar'
    });
  }

  noAccountWithEmail(): ValidatorFn {
    return() : ValidationErrors | null => {
      const accountExists = this.authService.noAccountWithEmail == '';

      if(!accountExists) {
        this.authService.noAccountWithEmail = '';
      }

      return !accountExists ? {noAccount: true} : null;
    }
  }
}

@Component({
  selector: 'snack-bar-email-sent',
  template: `
    <div>
      <img src="./assets/img/send_email.svg">
      <span>Email versendet</span>
    </div>`,
  styles: `
    div {display: flex; justify-content: center; align-items: center; gap: 20px}
  `,
  standalone: true,
})
export class SnackbarComponentEmailSent { }
