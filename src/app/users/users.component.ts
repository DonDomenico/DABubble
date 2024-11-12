import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { User } from './user.interface';
import { UserService } from '../services/users.service';

import { DialogModule } from '@angular/cdk/dialog';
import { MatDialog } from '@angular/material/dialog';

import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ DialogModule, RouterModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  authService = inject(AuthenticationService);
  userList: User[] = [];
  @Output() toggleSingleMessage: EventEmitter<any> = new EventEmitter();
  isSingleMessageHideen = false;

  constructor(private userService: UserService, private dialog: MatDialog, private router: Router) {
 
  }

  getList(): User[] {
    return this.userService.users;
  }

}
