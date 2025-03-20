import { inject, Injectable } from '@angular/core';
import {
  Auth, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
  deleteUser,
  signInWithRedirect,
  getRedirectResult
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserService } from './users.service';
import { arrayUnion, doc, Firestore, getDocs, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { ConversationsService } from './conversations.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  firebaseAuth = inject(Auth);
  userService = inject(UserService);
  conversationService = inject(ConversationsService);
  router = inject(Router);
  google = new GoogleAuthProvider();
  firestore = inject(Firestore);
  emailChanged: boolean = false;
  currentUser: any;
  passwordError = '';
  tooManyRequests = '';
  emailAlreadyExists = '';
  noAccountWithEmail = '';
  emailVerificationError = '';

  constructor() {
    onAuthStateChanged(this.firebaseAuth, user => {
      if (user) {
        this.currentUser = user;
      }
    })
  }

  async createUser(email: string, username: string, password: string, photoUrl: string) {
    await createUserWithEmailAndPassword(this.firebaseAuth, email, password).then(async (response) => {
      updateProfile(response.user, { displayName: username, photoURL: photoUrl });
      await this.saveUserInFirestore(response.user.uid, username, email, photoUrl);
      this.sendVerificationMail();
      this.addInitialConversations(response.user.uid);
      this.addUserToWelcomeChannel(response.user.uid, 'DTCcKIo8o4tlQw78i1cI');
      this.router.navigateByUrl('');
    }).catch(error => {
      this.emailAlreadyExists = error.code;
      console.log(error); //Testcode, später löschen
    })
  }

  addInitialConversations(userId: string) {
    this.conversationService.addNewConversation(userId, userId);
    this.conversationService.addNewConversation(userId, 'hBEeS6IqIUb8QIlkviFuIqcowNl1');
    this.conversationService.addNewConversation(userId, 'LNdN79V9tUcvOJ5shJ5cu7hcVoH2');
  }

  async addUserToWelcomeChannel(userId: string, channelId: string) {
    if (userId !== undefined) {
      await updateDoc(doc(this.firestore, 'channels', channelId), {
        member: arrayUnion(userId),
      });
    }
  }

  async saveUserInFirestore(uid: string, username: string, email: string, photoUrl: string) {
    setDoc(doc(this.firestore, "users", uid), {
      uid: uid,
      username: username,
      email: email,
      photoURL: photoUrl,
      active: false,
      accountActive: true
    }).then(() => {
      console.log('User added to database'); //später löschen
    }).catch((err) => {
      console.error(err);
      // Fehlermeldung auf der Seite anzeigen
    })
  }

  showCurrentUser() {
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if (user) {
        this.currentUser = user;
        console.log('current user: ', this.currentUser); //Testcode, später löschen
      } else {
        console.log('No user signed in'); //Testcode, später löschen
      }
    });
  }

  login(email: string, password: string) {
    signInWithEmailAndPassword(this.firebaseAuth, email, password).then(userCredential => {
      if (userCredential.user.emailVerified) {
        console.log('Sign in successful | Username: ', userCredential.user.displayName); //Testcode, später löschen
        let user = this.userService.users.find((user) => user.uid === userCredential.user.uid);
        this.userService.setStatusActive(user);
        this.router.navigateByUrl('general-view');
      } else {
        this.emailVerificationError = 'Bitte verifizieren Sie Ihr Konto über die zugesendete E-Mail.';
        console.log(this.emailVerificationError); //Testcode, später löschen
      }
    }).catch(error => {
      if (error.code == 'auth/invalid-credential') {
        this.passwordError = error.code;
        console.log('Password Error: ', this.passwordError); //Testcode, später löschen
      } else if (error.code == 'auth/too-many-requests') {
        this.tooManyRequests = error.code;
        console.log('Request Error: ', this.tooManyRequests); //Testcode, später löschen
      }
    })
  }

  // loginFromLocalStorage() {
  // }

  async sendMailResetPassword(email: string) {
    const emailInDatabase = query(this.userService.getUserRef(), where('email', '==', email));
    const querySnapshot = await getDocs(emailInDatabase);

    if (!querySnapshot.empty) {
      sendPasswordResetEmail(this.firebaseAuth, email);
    } else {
      this.noAccountWithEmail = 'no Account with email';
    }
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
      const emailFound = this.userService.users.filter(user => user.email == result.user.email);
      if (result.user.email && result.user.displayName && result.user.photoURL && emailFound.length === 0) {
        let photoURL = result.user.photoURL;
        // if ((photoURL.indexOf('googleusercontent.com') != -1) || (photoURL.indexOf('ggpht.com') != -1)) {
        //   photoURL = photoURL + '?sz=' + 24;
        // }
        await this.saveUserInFirestore(result.user.uid, result.user.displayName, result.user.email, photoURL);
        this.addInitialConversations(result.user.uid);
        this.addUserToWelcomeChannel(result.user.uid, 'DTCcKIo8o4tlQw78i1cI');
      } else {
        console.log('User already in database'); //Testcode, später löschen
      }
      setTimeout(() => {
        let user = this.userService.users.find((user) => user.uid === result.user.uid);
        this.userService.setStatusActive(user);
        this.router.navigateByUrl('general-view');
        // evtl loading spinner
      }, 500);
    }).catch(error => {
      console.log(error); //Testcode, später löschen
    })
  }

  // async signInWithGoogle() {
  //   await signInWithRedirect(this.firebaseAuth, this.google);
  //   await getRedirectResult(this.firebaseAuth).then(async result => {
  //     if (result) {
  //       const emailFound = this.userService.users.filter(user => user.email == result.user.email);
  //       if (result.user.email && result.user.displayName && result.user.photoURL && emailFound.length === 0) {
  //         let photoURL = result.user.photoURL;
  //         // if ((photoURL.indexOf('googleusercontent.com') != -1) || (photoURL.indexOf('ggpht.com') != -1)) {
  //         //   photoURL = photoURL + '?sz=' + 24;
  //         // }
  //         await this.saveUserInFirestore(result.user.uid, result.user.displayName, result.user.email, photoURL);
  //         this.addInitialConversations(result.user.uid);
  //         this.addUserToWelcomeChannel(result.user.uid, 'DTCcKIo8o4tlQw78i1cI');
  //       } else {
  //         console.log('User already in database'); //Testcode, später löschen
  //       }
  //       setTimeout(() => {
  //         let user = this.userService.users.find((user) => user.uid === result.user.uid);
  //         this.userService.setStatusActive(user);
  //         this.router.navigateByUrl('general-view');
  //         // evtl loading spinner
  //       }, 500);
  //     }
  //   }).catch(error => {
  //     console.log(error);
  //   })
  // }



  guestLogIn() {
    signInAnonymously(this.firebaseAuth).then(result => {
      console.log(result); //Testcode, später löschen
      const randomNumberForName = Math.round(Math.random() * 1000);
      updateProfile(result.user, { displayName: `Guest${randomNumberForName}` });
      this.router.navigateByUrl('general-view');
    }).catch(error => {
      console.log(error); //Testcode, später löschen
    })
  }

  // async logout() {
  //   if (!this.currentUser.displayName.startsWith('Guest')) {
  //     await this.userService.setStatusInactive(this.currentUser);
  //   }
  //   setTimeout(async () => {
  //     await signOut(this.firebaseAuth);
  //     this.currentUser = null;
  //     this.router.navigateByUrl('');
  //   }, 500);
  // }

  async logout() {
    if (!this.currentUser.displayName.startsWith('Guest')) {
      await this.userService.setStatusInactive(this.currentUser);
    }
    // setTimeout(async () => {
    //   await signOut(this.firebaseAuth);
    //   this.currentUser = null;
    //   this.router.navigateByUrl('');
    // }, 500);
    signOut(this.firebaseAuth).then(() => {
      this.currentUser = null;
      this.router.navigateByUrl('');
    }).catch(error => {
      this.router.navigateByUrl('');
    })
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

  async reauthenticateUser(email: string, password: string): Promise<boolean> {
    const credentials = EmailAuthProvider.credential(email, password);
    let userAuthenticated: boolean = false;

    if (this.currentUser !== null) {
      await reauthenticateWithCredential(this.currentUser, credentials).then(() => {
        console.log('User reauthenticated!');
        userAuthenticated = true;
      }).catch(error => {
        console.log(error); //später löschen
        if (error.code == 'auth/invalid-credential') {
          this.passwordError = error.code;
        } else if (error.code == 'auth/too-many-requests') {
          this.tooManyRequests = error.code;
        }
        userAuthenticated = false;
      })
    }
    return userAuthenticated;
  }

  async updateEmailAddress(newEmail: string) {
    if (this.currentUser !== null) {
      await verifyBeforeUpdateEmail(this.currentUser, newEmail).then(() => {
        console.log('Verification Mail sent');
      }).catch(error => {
        console.log(error)
      });
    }
  }

  updateAvatar(url: string) {
    if (this.currentUser !== null) {
      updateProfile(this.currentUser, { photoURL: url });
    }
  }

  async deleteAccount() {
    deleteUser(this.currentUser).then(() => {
      console.log('Account deleted: ', this.currentUser);
      this.router.navigateByUrl('');
    }).catch((error) => {
      console.log(error.code);
    });
  }
}
