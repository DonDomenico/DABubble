import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormsModule, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../users/user.interface';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, MatCardModule, RouterLink, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  user: User = {
    username: '',
    email: '',
    password: ''
  }

  authService = inject(AuthenticationService);
  router = inject(Router);
  hide = true;
  email = new FormControl('', [Validators.required, Validators.email]);
  errorMessage = '';

  constructor() {
    merge(this.email.statusChanges, this.email.valueChanges).pipe(takeUntilDestroyed()).subscribe(() => 
    this.updateErrorMessage());
  }

  async registerUser() {
    await this.authService.createUser(this.user.email, this.user.username, this.user.password);
    this.router.navigateByUrl('general-view');
  }

  updateErrorMessage() {
    if (this.email.hasError('required')) {
      this.errorMessage = 'You must enter a value';
    } else if (this.email.hasError('email')) {
      this.errorMessage = 'Not a valid email';
    } else {
      this.errorMessage = '';
    }
  }
}
