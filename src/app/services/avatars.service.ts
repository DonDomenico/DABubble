import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AvatarsService {
  profileImg = './assets/img/person.svg';
  avatars = ['./assets/img/avatar1.svg', './assets/img/avatar2.svg', './assets/img/avatar3.svg', './assets/img/avatar4.svg', './assets/img/avatar5.svg', './assets/img/avatar6.svg'];

  constructor() { }

  changeAvatarImg(url: string) {
    this.profileImg = url;
  }
}
