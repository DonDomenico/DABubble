import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogClose,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { AuthenticationService } from '../../services/authentication.service';
@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [MatIconModule,  MatDialogClose],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrl: './edit-profile-dialog.component.scss'
})
export class EditProfileDialogComponent {
  authService = inject(AuthenticationService);


}
