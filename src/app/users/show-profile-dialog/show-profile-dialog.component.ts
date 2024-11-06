import { Component, inject, Inject, OnInit } from '@angular/core';
import {
  MatDialogModule,
  MatDialogClose,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/users.service';
import { User } from '../user.interface';
import { getDoc } from '@angular/fire/firestore';
import { AuthenticationService } from '../../services/authentication.service';
@Component({
  selector: 'app-show-profile-dialog',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, MatDialogClose, MatButtonModule],
  templateUrl: './show-profile-dialog.component.html',
  styleUrl: './show-profile-dialog.component.scss',
})
export class ShowProfileDialogComponent implements OnInit {
  authService = inject(AuthenticationService);
  userId: string = '';
  user: User | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { uid: string },
    private userService: UserService
  ) {
    this.userId = data.uid;
  }

  ngOnInit(): void {
    this.getSingleUser();
  }

  async getSingleUser() {
    if (this.userId) {
      const userRef = this.userService.getSingleUserRef(this.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        this.user = this.userService.toJson(userDoc.data(), userDoc.id);
      } else {
        console.log('No such document!');
      }
    } else {
      // this.user = this.userService.users[2];
      this.authService.showCurrentUser();
    }
  }
}
