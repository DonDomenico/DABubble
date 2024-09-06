import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-choose-profile-image',
  standalone: true,
  imports: [MatCardModule, RouterModule],
  templateUrl: './choose-profile-image.component.html',
  styleUrl: './choose-profile-image.component.scss'
})
export class ChooseProfileImageComponent {
  authService = inject(AuthenticationService);


}
