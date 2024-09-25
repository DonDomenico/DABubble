import { inject, Injectable } from '@angular/core';
import { onSnapshot } from "firebase/firestore";
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { User } from '../users/user.interface';
import { Conversation } from '../interfaces/conversation';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  firestore = inject(Firestore);
  users: User [] = [];

  conversations: Conversation [] = [];

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

  getConversationRef () {
    return collection(this.firestore, 'conversations');
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
