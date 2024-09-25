import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from './user.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  users: User[] = [
    {
      username: 'Frederik Beck',
      img: './assets/img/avatar3.svg',
      email: ''
    },
    {
      username: 'Sophia Müller',
      img: './assets/img/avatar5.svg',
      email: ''
    },
    {
      username: 'Noah Braun',
      img: './assets/img/avatar4.svg',
      email: ''
    },
    {
      username: 'Elise Roth',
      img: './assets/img/avatar2.svg',
      email: ''
    },
    {
      username: 'Elias Neumann',
      img: './assets/img/avatar1.svg',
      email: ''
    },
    {
      username: 'Steffen Hoffmann',
      img: './assets/img/avatar6.svg',
      email: ''
    },
  ];
user: any;
}
