import { inject, Injectable } from '@angular/core';
import { onSnapshot } from "firebase/firestore";
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { User } from '../users/user.interface';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  firestore = inject(Firestore);

  constructor() { }

  getUserRef() {
    return collection(this.firestore, 'users');
  }

  async saveUser(username: string, email: string) {
      await addDoc(collection(this.firestore, "users"), {
        username: username,
        email: email
      }).catch(
        (err) => { console.error(err) }
      ).then(
        () => {
          console.log('User added to database');
        }
      );
  }
}
