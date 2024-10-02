import { inject, Injectable } from '@angular/core';
import { onSnapshot } from "firebase/firestore";
import { addDoc, collection, doc, Firestore, query, updateDoc, where } from '@angular/fire/firestore';
import { User } from '../users/user.interface';
import { Conversation } from '../interfaces/conversation';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  firestore = inject(Firestore);
  userId = "";
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

  getSingleUserRef(uid: string) {
    return doc(this.getUserRef(), uid);
  }

  // Möglichkeit finden, an den aktuellen Nutzer heranzukommen
  // queryUserConversations = query(this.getConversationsRef(), where('participants', 'array-contains', this.authService.currentUser?.uid));

  subUserList() {
    return onSnapshot(this.getUserRef(), userList => {
      this.users = [];
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
      email: obj.email || "",
      photoURL: obj.photoURL || "",
      active: obj.active
    }
  }

  
}
