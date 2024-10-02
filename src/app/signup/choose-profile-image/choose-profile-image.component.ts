import { Component, inject, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';
import { FirestoreService } from '../../services/firestore.service';

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
  firestore = inject(FirestoreService);
  authService = inject(AuthenticationService);
  formData;

  constructor(private _snackBar: MatSnackBar, private router: Router) {
    console.log('form data received: ', this.router.getCurrentNavigation()?.extras.state);
    this.formData = this.router.getCurrentNavigation()?.extras.state;
  }

  profileImg = './assets/img/person.svg';
  avatars = ['./assets/img/avatar1.svg', './assets/img/avatar2.svg', './assets/img/avatar3.svg', './assets/img/avatar4.svg', './assets/img/avatar5.svg', './assets/img/avatar6.svg'];

  changeAvatarImg(url: string) {
    this.profileImg = url;
  }

  showFormData() {
    if(this.formData) {
      console.log(this.formData['username'], this.formData['email']);
    }
  }

  async submit() {
    if(this.formData) {
        await this.authService.createUser(this.formData!['email'], this.formData!['username'], this.formData!['password'])
        await this.authService.setProfilePhoto(this.profileImg);
        await this.authService.updateUserPhoto(this.profileImg, this.firestore.userId);
        this.showSnackBar();
        setTimeout(() => {
          this.router.navigateByUrl('/');
          this.authService.logout();
        }, 2000);
    }
  }

  showSnackBar() {
    this._snackBar.open('Konto erfolgreich erstellt', '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 1800,
      panelClass: 'snackbar'
    });
  }
}
