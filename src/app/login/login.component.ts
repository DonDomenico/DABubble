import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormsModule, Validators, ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
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
    password: ['', [Validators.required, Validators.requiredTrue]]
  })

}
