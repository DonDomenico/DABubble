import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../services/authentication.service';
import { Validators, ReactiveFormsModule, FormBuilder, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import { IntroComponent } from '../intro/intro.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCardModule, RouterLink, ReactiveFormsModule, MatDividerModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  authService = inject(AuthenticationService);
  router = inject(Router);
  fb = inject(FormBuilder);
  dividerText = 'ODER';
  passwordVisible: boolean = false;

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', {
      validators: [Validators.required, this.passwordMatchesEmail(), this.loginAttempts(), this.emailNotVerified()]
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

  emailNotVerified(): ValidatorFn {
    return() : ValidationErrors | null => {
      const emailVerified = this.authService.emailVerificationError == '';

      if(!emailVerified) {
        this.authService.emailVerificationError = '';
      }

      return !emailVerified ? {emailNotVerfified: true} : null;
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