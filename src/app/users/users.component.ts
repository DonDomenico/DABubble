import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { User } from './user.interface';
import { UserService } from '../services/users.service';
import { DialogModule } from '@angular/cdk/dialog';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [DialogModule, RouterModule, CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  authService = inject(AuthenticationService);
  userList: User[] = [];
  @Output() toggleSingleMessage: EventEmitter<any> = new EventEmitter();
  isSingleMessageHidden = false;

  constructor(
    public userService: UserService,
  ) {}

  getList(): User[] {
    let users = this.userService.users.filter((user) => user.uid !== this.authService.currentUser?.uid)
    return users;
  }
}
