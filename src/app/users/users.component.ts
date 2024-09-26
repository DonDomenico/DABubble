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
    // this.userList = this.getList();
  }

  getList(): User[] {
return this.userService.users;
  }

//   users: User[] = [
//     {
//       username: 'Frederik Beck',
//       img: './assets/img/avatar3.svg',
//       email: '',
//       active: false
//     },
//     {
//       username: 'Sophia Müller',
//       img: './assets/img/avatar5.svg',
//       email: '',
//       active: false
//     },
//     {
//       username: 'Noah Braun',
//       img: './assets/img/avatar4.svg',
//       email: '',
//       active: false
//     },
//     {
//       username: 'Elise Roth',
//       img: './assets/img/avatar2.svg',
//       email: '',
//       active: false
//     },
//     {
//       username: 'Elias Neumann',
//       img: './assets/img/avatar1.svg',
//       email: '',
//       active: false
//     },
//     {
//       username: 'Steffen Hoffmann',
//       img: './assets/img/avatar6.svg',
//       email: '',
//       active: false
//     },
//   ];
// user: any;
}
