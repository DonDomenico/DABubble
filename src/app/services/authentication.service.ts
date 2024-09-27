import { inject, Injectable } from '@angular/core';
import {
  Auth, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously
} from '@angular/fire/auth';
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
  google = new GoogleAuthProvider();

  currentUser = this.firebaseAuth.currentUser;
  // possibly not the best way to check if the password matches the email-address
  passwordError = '';
  tooManyRequests = '';
  emailAlreadyExists = '';
  noAccountWithEmail = '';

  async createUser(email: string, username: string, password: string) {
    await createUserWithEmailAndPassword(this.firebaseAuth, email, password).then((response) => {
      updateProfile(response.user, { displayName: username });
      this.currentUser = response.user;
      this.firestore.saveUser(response.user.uid, username, email);
      this.sendVerificationMail();
      this.router.navigateByUrl('');
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

  async setProfilePhoto(userPhoto: string) {
    if (this.currentUser !== null) {
      await updateProfile(this.currentUser, { photoURL: userPhoto }).then(() => {
        console.log('Photo updated'); //Testcode, später löschen
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
      this.router.navigateByUrl('general-view');
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
    if (this.currentUser) {
      sendEmailVerification(this.currentUser)
        .then(() => {
          console.log('Verification Mail sent'); //Testcode, später löschen
        }).catch(error => {
          console.log(error.code); //Testcode, später löschen
        });
    }
  }

  async signInWithGoogle() {
    await signInWithPopup(this.firebaseAuth, this.google).then(result => {
      console.log(result); //Testcode, später löschen
      const emailFound = this.firestore.users.filter(user => user.email == result.user.email);
      if(result.user.email && result.user.displayName && result.user.email && emailFound.length == 0) {
        this.firestore.saveUser(result.user.uid, result.user.displayName, result.user.email);
        this.firestore.updateUserPhoto(result.user.photoURL!+".svg", this.firestore.docRefId);
      } else {
        console.log('User already in database'); //Testcode, später löschen
      }
    }).catch(error => {
      console.log(error); //Testcode, später löschen
    })
    this.router.navigateByUrl('general-view');
  }

  guestLogIn() {
    signInAnonymously(this.firebaseAuth).then(result => {
      console.log(result); //Testcode, später löschen
      updateProfile(result.user, { displayName: 'Guest' });
      this.router.navigateByUrl('general-view');
    }).catch(error => {
      console.log(error); //Testcode, später löschen
    })
  }

  // async resetPassword(newPassword: string, url: string) {
  //   let user = await this.getUserFromEmail(url);
  //   if (user != null)
  //     updatePassword(this.currentUser, newPassword).then(() => {
  //       console.log('Password reseted, new Password is: ', newPassword);
  //     }).catch((error) => {
  //       console.log(error);
  //     });
  // }

  // async getUserFromEmail(url: string) {
  //   const regex = /\/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\?/;
  //   const match = url.match(regex);

  //   if (match) {
  //     console.log("user:", match[1]);
  //     return match[1];
  //   } else {
  //     console.log("user nicht gefunden");
  //     return null;
  //   }
  // }

  logout() {
    this.currentUser = null;
    signOut(this.firebaseAuth);
    this.router.navigateByUrl('');
  }
}
