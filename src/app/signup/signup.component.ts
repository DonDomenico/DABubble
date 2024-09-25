import { Component, inject, Output, output } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormsModule, Validators, ReactiveFormsModule, FormBuilder, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { NgStyle } from '@angular/common';
import { FirestoreService } from '../services/firestore.service';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, MatCardModule, RouterLink, ReactiveFormsModule, NgStyle],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  firestore = inject(FirestoreService);
  authService = inject(AuthenticationService);
  router = inject(Router);
  fb = inject(FormBuilder);
  checkbox = new FormControl(false, Validators.requiredTrue);
  emailInDatabase = false;

  registerForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email, this.emailAlreadyExists()]],
    password: ['', [Validators.required]]
  })

  @Output() formData = {};

  async onSubmit() {
    // find a way to check, if an account with the email-address already exists before directing to next page
    // maybe use firestore to check if email exists
    await this.searchEmailInDatabase();
    if(this.emailInDatabase == false) {
      console.log('form data sent: ', this.registerForm.value, this.registerForm.valid); // Testcode, später löschen
      this.formData = this.registerForm.getRawValue();
      this.router.navigate(['signup/select-avatar'], {  state: this.formData } );
    }
  }

  async searchEmailInDatabase() {
    const emailFound = this.firestore.users.filter(user => user.email == this.registerForm.get('email')?.value);
    if(emailFound.length != 0) {
      this.emailInDatabase = true;
    }
  }

  onInputChange() {
    this.emailInDatabase = false;
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
