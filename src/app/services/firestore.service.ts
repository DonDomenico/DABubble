import { inject, Injectable } from '@angular/core';
import { onSnapshot } from "firebase/firestore";
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { User } from '../users/user.interface';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  firestore = inject(Firestore);
  users: User [] = [];
  unsubUserList;

  constructor() { 
    this.unsubUserList = this.subUserList();
  }

  ngOnDestroy() {
    this.unsubUserList();
  }

  getUserRef() {
    return collection(this.firestore, 'users');
  }

  async saveUser(uid: string, username: string, email: string) {
    await addDoc(collection(this.firestore, "users"), {
      uid: uid,
      username: username,
      email: email
    }).catch(
      (err) => { console.error(err) }
    ).then(
      () => {
        console.log('User added to database');
      }
    )
  }

  subUserList() {
    return onSnapshot(this.getUserRef(), userList => {
      userList.forEach(user => {
        console.log(this.toJson(user.data(), user.id));
        this.users.push(this.toJson(user.data(), user.id));
      })
    })
  }

  toJson(obj: any, id?: string): User {
    return {
      id: id || "",
      username: obj.username || "",
      email: obj.email || ""
    }
  }
}
