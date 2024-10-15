import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from './user.interface';
import { UserService } from '../services/users.service';
import { ShowProfileDialogComponent } from './show-profile-dialog/show-profile-dialog.component';
import { DialogModule } from '@angular/cdk/dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  userList: User[] = [];

  constructor(private userService: UserService, private dialog: MatDialog) {
 
  }

  getList(): User[] {
    return this.userService.users;
  }

showProfileDialog() {
    this.dialog.open(ShowProfileDialogComponent);
  }

}
