import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from '@angular/fire/auth';
import { User } from '../users/user.interface';
import { Router } from '@angular/router';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  firebaseAuth = inject(Auth);
  firestore = inject(FirestoreService);
  router = inject(Router);

  currentUser = this.firebaseAuth.currentUser;
  // possibly not the best way to check if the password matches the email-address
  passwordError = '';
  tooManyRequests = '';
  emailAlreadyExists = '';
  noAccountWithEmail = '';

  async createUser(user: User) {
    await createUserWithEmailAndPassword(this.firebaseAuth, user.email, user.password).then((response) => {
      updateProfile(response.user, { displayName: user.username });
      this.currentUser = response.user;
      this.firestore.saveUser(user.email, user.username);
      this.router.navigateByUrl('signup/select-avatar');
    }).catch(error => {
      this.emailAlreadyExists = error.code;
      console.log(error); //Testcode, später löschen
    })
  }

  showCurrentUser() {
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if (user) {
        this.currentUser = user;
        console.log('current user: ', user.displayName, user.photoURL); //Testcode, später löschen
      } else {
        console.log('No user signed in'); //Testcode, später löschen
      }
    });
  }

  // delete account from auth and firestore, if user leaves "choose-avatar-page" or goes back via back-arrow
  // or implement a function to cache the userdata and not create the account directly (maybe localStorage or sessionStorage)
  async setProfilePhoto(userPhoto: string) {
    if (this.currentUser !== null) {
      await updateProfile(this.currentUser, { photoURL: userPhoto }).then(() => {
        console.log('Photo updated'); //Testcode, später löschen
        this.sendVerificationMail();
      }).catch(() => {
        console.error('Something went wrong'); //Testcode, später löschen
      })
    } else {
      console.error('No user logged in'); //Testcode, später löschen
    }
  }

  async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.firebaseAuth, email, password).then((userCredential) => {
      console.log('Sign in successful | Username: ', userCredential.user.displayName); //Testcode, später löschen
    }).catch((error) => {
      if (error.code == 'auth/invalid-credential') {
        this.passwordError = error.code;
        console.log('Password Error: ', this.passwordError); //Testcode, später löschen
      } else if (error.code == 'auth/too-many-requests') {
        this.tooManyRequests = error.code;
        console.log('Request Error: ', this.tooManyRequests); //Testcode, später löschen
      }
    })
  }

  async sendMailResetPassword(email: string) {
    await sendPasswordResetEmail(this.firebaseAuth, email)
      .then(() => {
        console.log('Email sent'); //Testcode, später löschen
      })
      .catch((error) => {
        this.noAccountWithEmail = error.code;
        console.log(this.noAccountWithEmail); //Testcode, später löschen
      }
    );
  }

  sendVerificationMail() {
    if(this.currentUser) {
      sendEmailVerification(this.currentUser)
      .then(() => {
        console.log('Verification Mail sent'); //Testcode, später löschen
      });
    }
  }

  async logout() {
    await signOut(this.firebaseAuth);
  }
}
