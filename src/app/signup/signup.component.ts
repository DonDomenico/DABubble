import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormsModule, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, MatCardModule, RouterLink, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

  authService = inject(AuthenticationService);
  router = inject(Router);
  fb = inject(FormBuilder);

  registerForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  })

  registerUser() {
      this.authService.createUser(this.registerForm.getRawValue());
      this.router.navigateByUrl('general-view');
  }

  onSubmit() {
    console.log('submitted form', this.registerForm.value, this.registerForm.valid);
    // this.registerUser();
  }
}
