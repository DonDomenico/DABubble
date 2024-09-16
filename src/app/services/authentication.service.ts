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

  async createUser(user: User) {
    await createUserWithEmailAndPassword(this.firebaseAuth, user.email, user.password).then((response) => {
      updateProfile(response.user, { displayName: user.username });
      this.firestore.saveUser(user.email, user.username);
      this.currentUser = response.user;
      this.router.navigateByUrl('signup/select-avatar');
    }).catch(error => {
      console.log(error);
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

  async setProfilePhoto(userPhoto: string) {
    if (this.currentUser !== null) {
      updateProfile(this.currentUser, { photoURL: userPhoto }).then(() => {
        console.log('Photo updated'); //Testcode, später löschen
      }).catch(() => {
        console.error('Something went wrong'); //Testcode, später löschen
      })
    } else {
      console.error('No user logged in');
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
        console.log('Request Error: ', this.tooManyRequests);
      }
    })
  }

  sendMailResetPassword(email: string) {
    sendPasswordResetEmail(this.firebaseAuth, email)
      .then(() => {
        console.log('Email sent');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      }
    );
  }

  sendVerificationMail() {
    if(this.currentUser) {
      sendEmailVerification(this.currentUser)
      .then(() => {
        console.log('Verification Mail sent');
      });
    }
  }

  // create function to check if a user is already signed up
  async checkEmailInDatabase() {
    
  }

  async logout() {
    await signOut(this.firebaseAuth);
  }
}
