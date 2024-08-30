import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../users/user.interface';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  user : User = {
    username: '',
    email: '',
    password: ''
  }

  authService = inject(AuthenticationService);
  router = inject(Router);

  async registerUser() {
    await this.authService.createUser(this.user.email, this.user.username, this.user.password);
    this.router.navigateByUrl('/');
  }
}
