import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signOut, updateProfile } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor() { }

  firebaseAuth = inject(Auth);
  auth = getAuth();
  user = this.auth.currentUser;

  async createUser(email: string, username: string, password: string) {
    return createUserWithEmailAndPassword(this.firebaseAuth, email, password).then((response) => {
      updateProfile(response.user, {displayName: username});
    })
  }

  async showCurrentUser() {
    onAuthStateChanged(this.auth, (user) => {
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
