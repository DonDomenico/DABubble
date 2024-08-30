import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor() { }

  firebaseAuth = inject(Auth);

  async createUser(email: string, username: string, password: string) {
    return createUserWithEmailAndPassword(this.firebaseAuth, email, password).then((response) => {
      updateProfile(response.user, {displayName: username});
    })
  }
}
