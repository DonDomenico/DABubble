import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from './user.interface';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {

  userList: User[] = [];

  constructor(private userService: FirestoreService) {
 
  }

  getList(): User[] {
return this.userService.users;
  }

}
