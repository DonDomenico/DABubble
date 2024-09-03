import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from '@angular/fire/auth';
import { User } from '../users/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor() { }

  firebaseAuth = inject(Auth);

  async createUser(user: User) {
    await createUserWithEmailAndPassword(this.firebaseAuth, user.email, user.password).then((response) => {
      updateProfile(response.user, {displayName: user.username});
    })
  }

  showCurrentUser() {
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if(user) {
        console.log(user.uid, user.displayName);
      } else {
        console.log('No user signed in');
      }
    })
  }

  async logout() {
    await signOut(this.firebaseAuth);
  }
}
