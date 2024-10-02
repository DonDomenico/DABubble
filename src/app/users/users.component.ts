import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from './user.interface';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  userList: User[] = [];

  constructor(private userService: UserService) {
 
  }

  getList(): User[] {
    return this.userService.users;
  }

}
