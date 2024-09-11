import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-choose-profile-image',
  standalone: true,
  imports: [MatCardModule, RouterModule],
  templateUrl: './choose-profile-image.component.html',
  styleUrl: './choose-profile-image.component.scss'
})
export class ChooseProfileImageComponent {
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(private _snackBar: MatSnackBar) {}
  
  authService = inject(AuthenticationService);
  router = inject(Router);

  profileImg = './assets/img/person.svg';
  avatars = ['./assets/img/avatar1.svg', './assets/img/avatar2.svg', './assets/img/avatar3.svg', './assets/img/avatar4.svg', './assets/img/avatar5.svg', './assets/img/avatar6.svg'];

  changeAvatarImg(url: string) {
    this.profileImg = url;
  }

  submit() {
    this.showSnackBar();
    setTimeout(() => {
      this.authService.setProfilePhoto(this.profileImg);
      this.router.navigateByUrl('/');
    }, 2000);
  }

  showSnackBar() {
    this._snackBar.open('Konto erfolgreich erstellt', '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2000,
      panelClass: 'snackbar'
    });
  }
}
