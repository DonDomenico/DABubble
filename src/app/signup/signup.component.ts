import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormsModule, Validators, ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
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
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })

  async registerUser() {
      await this.authService.createUser(this.registerForm.getRawValue());
  }

  onSubmit() {
    console.log('submitted form', this.registerForm.value, this.registerForm.valid);
    this.router.navigateByUrl('signup/select-avatar');
    this.registerUser();
  }
}
