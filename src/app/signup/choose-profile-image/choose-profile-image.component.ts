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

  profileImg = './assets/img/person.svg';
  avatars = ['./assets/img/avatar1.svg', './assets/img/avatar2.svg', './assets/img/avatar3.svg', './assets/img/avatar4.svg', './assets/img/avatar5.svg', './assets/img/avatar6.svg'];

  changeAvatarImg(url: string) {
    this.profileImg = url;
  }
}
