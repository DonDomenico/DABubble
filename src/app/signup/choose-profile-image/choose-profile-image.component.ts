import { Component, inject, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';
import { UserService } from '../../services/users.service';
import { AvatarsService } from '../../services/avatars.service';

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
  userService = inject(UserService);
  authService = inject(AuthenticationService);
  formData;

  constructor(private _snackBar: MatSnackBar, private router: Router, public avatarService: AvatarsService) {
    console.log('form data received: ', this.router.getCurrentNavigation()?.extras.state);
    this.formData = this.router.getCurrentNavigation()?.extras.state;
  }

  showFormData() {
    if(this.formData) {
      console.log(this.formData['username'], this.formData['email']);
    }
  }

  async submit() {
    if(this.formData) {
        await this.authService.createUser(this.formData['email'], this.formData['username'], this.formData['password'], this.avatarService.profileImg);
        this.showSnackBar();
        setTimeout(() => {
          this.router.navigateByUrl('/');
          this.authService.logout();
        }, 2000);
    }
  }

  showSnackBar() {
    this._snackBar.open('Konto erfolgreich erstellt. Bitte verifizieren Sie ihre Email-Adresse durch einen Klick auf den zugesendeten Link.', 'Ok', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: 'snackbar'
    });
  }
}
