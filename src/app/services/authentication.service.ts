import { inject, Injectable } from '@angular/core';
import {
  Auth, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  updateEmail
} from '@angular/fire/auth';
import { User } from '../users/user.interface';
import { Router } from '@angular/router';
import { UserService } from './users.service';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  firebaseAuth = inject(Auth);
  userService = inject(UserService);
  router = inject(Router);
  google = new GoogleAuthProvider();
  firestore = inject(Firestore);

  currentUser = this.firebaseAuth.currentUser;
  passwordError = '';
  tooManyRequests = '';
  emailAlreadyExists = '';
  noAccountWithEmail = '';

  async createUser(email: string, username: string, password: string, photoUrl: string) {
    await createUserWithEmailAndPassword(this.firebaseAuth, email, password).then(async (response) => {
      updateProfile(response.user, { displayName: username, photoURL: photoUrl });
      this.currentUser = response.user;
      await this.saveUserInFirestore(response.user.uid, username, email, photoUrl);
      this.sendVerificationMail();
      this.router.navigateByUrl('');
    }).catch(error => {
      this.emailAlreadyExists = error.code;
      console.log(error); //Testcode, später löschen
    })
  }

  async saveUserInFirestore(uid: string, username: string, email: string, photoUrl: string) {
    setDoc(doc(this.firestore, "users", uid), {
      uid: uid,
      username: username,
      email: email,
      photoURL: photoUrl,
      active: false
    }).then(() => {
        console.log('User added to database');
      }
    ).catch((err) => { 
        console.error(err);
      }
    )
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

  login(email: string, password: string) {
    signInWithEmailAndPassword(this.firebaseAuth, email, password).then((userCredential) => {
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

  loginFromLocalStorage() {
    
  }

  sendMailResetPassword(email: string) {
    sendPasswordResetEmail(this.firebaseAuth, email)
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
    await signInWithPopup(this.firebaseAuth, this.google).then(async result => {
      console.log(result); //Testcode, später löschen
      const emailFound = this.userService.users.filter(user => user.email == result.user.email);
      if(result.user.email && result.user.displayName && result.user.photoURL && emailFound.length == 0) {
        await this.saveUserInFirestore(result.user.uid, result.user.displayName, result.user.email, result.user.photoURL);
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

  logout() {
    signOut(this.firebaseAuth);
    this.currentUser = null;
    this.router.navigateByUrl('');
  }

  async updateUsernameInAuth(newName: string) {
    if (this.currentUser !== null && newName) {
      updateProfile(this.currentUser, {
        displayName: newName
      }).then(() => {
        console.log('Username updated')
      }).catch((error) => {
        console.error(error)
      });
    }
  }

  async updateEmailInAuth(newEmail: string) {
    if (this.currentUser !== null && newEmail !== "") {
      updateEmail(this.currentUser, newEmail).then(() => {
        console.log('Email Adress changed');
      }).catch((error) => {
        console.log('An error occured: ', error);
      })
    }
  }
}
