import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormsModule, Validators, ReactiveFormsModule, FormBuilder, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { NgStyle } from '@angular/common';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, MatCardModule, RouterLink, ReactiveFormsModule, NgStyle],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

  authService = inject(AuthenticationService);
  router = inject(Router);
  fb = inject(FormBuilder);
  checkbox = new FormControl(false, Validators.requiredTrue);

  registerForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email, this.emailAlreadyExists()]],
    password: ['', [Validators.required]]
  })

  async registerUser() {
      await this.authService.createUser(this.registerForm.getRawValue());
  }

  async onSubmit() {
    console.log('submitted form', this.registerForm.value, this.registerForm.valid); // Testcode, später löschen
    await this.registerUser();
    // this.registerForm.reset();
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
}
