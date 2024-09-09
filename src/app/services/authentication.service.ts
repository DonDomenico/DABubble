import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signOut, updateProfile, user } from '@angular/fire/auth';
import { User } from '../users/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor() { }

  firebaseAuth = inject(Auth);
  currentUser = this.firebaseAuth.currentUser;

  async createUser(user: User) {
    await createUserWithEmailAndPassword(this.firebaseAuth, user.email, user.password).then((response) => {
      updateProfile(response.user, {displayName: user.username});
    })
  }

  showCurrentUser() {
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if (user) {
        this.currentUser = user;
        console.log('current user: ', user.displayName);
      } else {
        console.log('No user signed in')
      }
    });
  }

  async setProfilePhoto(userPhoto: string) {
    if(this.currentUser !== null) {
      updateProfile(this.currentUser, {photoURL: userPhoto}).then(() => {
        console.log('Photo updated');
      }).catch(() => {
        console.error('Something went wrong');
      })
    }
  }

  async logout() {
    await signOut(this.firebaseAuth);
  }
}
