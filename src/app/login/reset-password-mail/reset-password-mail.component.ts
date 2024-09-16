import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { FormsModule, Validators, ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';

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

  sendMailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  })

  onSubmit(email: string) {
    this.authService.sendMailResetPassword(email);
  }
}
