import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormsModule, Validators, ReactiveFormsModule, FormBuilder, FormControl, AsyncValidatorFn, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { NgStyle } from '@angular/common';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatCardModule, RouterLink, ReactiveFormsModule, NgStyle, MatDividerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  authService = inject(AuthenticationService);
  router = inject(Router);
  fb = inject(FormBuilder);
  dividerText = 'ODER';

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', {
      validators: [Validators.required, this.passwordMatchesEmail(), this.loginAttempts()]
    }]
  })

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
}
