import { Component, inject, Inject, OnInit, Input } from '@angular/core';
import {
  MatDialogModule,
  MatDialog,
  MatDialogClose,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/users.service';
import { User } from '../user.interface';
import { getDoc } from '@angular/fire/firestore';
import { AuthenticationService } from '../../services/authentication.service';
import { EditProfileDialogComponent } from '../edit-profile-dialog/edit-profile-dialog.component';
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
  edit = false;
  // user: User | undefined;
  @Input() user!: User;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { uid: string },
    private userService: UserService,
    public dialog: MatDialog
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
      this.authService.showCurrentUser();
    }
  }

  editUserProfile() {
    this.edit = true;
    this.authService.showCurrentUser();
    this.dialog.open(EditProfileDialogComponent, {
      data: {
        currentuser: this.authService.currentUser, 
        // user: this.userService.users
        user: this.user,
  
      }
    })
    // this.dialog.closeAll();
  }
}
