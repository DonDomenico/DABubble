import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor() { }

  firebaseAuth = inject(Auth);

  async createUser(email: string, username: string, password: string) {
    await createUserWithEmailAndPassword(this.firebaseAuth, email, password).then((response) => {
      updateProfile(response.user, {displayName: username});
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
