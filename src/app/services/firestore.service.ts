import { inject, Injectable } from '@angular/core';
import { onSnapshot } from "firebase/firestore";
import { addDoc, collection, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { User } from '../users/user.interface';
import { Conversation } from '../interfaces/conversation';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  firestore = inject(Firestore);
  userId = "";
  users: User [] = [];

  conversations: Conversation [] = [];

  unsubUserList;

  unsubConversation;

  constructor() { 
    this.unsubUserList = this.subUserList();

    this.unsubConversation = this.subConversation();
  }

  ngOnDestroy() {
    this.unsubUserList();
    this.unsubConversation();
  }

  getUserRef() {
    return collection(this.firestore, 'users');
  }

  getConversationsRef () {
    return collection(this.firestore, 'conversations');
  }

  async saveUser(uid: string, username: string, email: string) {
    await addDoc(collection(this.firestore, "users"), {
      uid: uid,
      username: username,
      email: email,
      photoURL: "",
      active: false
    }).then((docRef) => {
        console.log('User added to database');
        this.userId = docRef.id;
      }
    ).catch((err) => { 
      console.error(err) 
      }
    )
  }

  async updateUserPhoto(photoURL: string, userId: string) {
    await updateDoc(doc(this.firestore, "users", userId), {
      photoURL: photoURL
    })
  }

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

  subConversation() {
    return onSnapshot(this.getConversationsRef(), conversationList => {
      this.conversations = [];
      conversationList.forEach(conversation => {
        console.log(this.toJsonConversation(conversation.data(), conversation.id), conversation.data());
        this.conversations.push(this.toJsonConversation(conversation.data(), conversation.id));
      })
    })
  }

  toJsonConversation(obj: any, id?: string): Conversation {
    return {
      docId: id || "",
      initiatedAt: obj.initiatedAt || "",
      initiatedBy: obj.initiatedBy || "",
      lastMessage: [{
        message: obj.lastMessage.message || "",
        messageType: obj.lastMessage.messageType || "",
        recipientId: obj.lastMessage.recipientId || "",
        senderId: obj.lastMessage.senderId || "",
        status: obj.lastMessage.status || "",
        timestamp: obj.lastMessage.timestamp || ""
    }],
      messages: [{
        message: obj.message || "",
        messageType: obj.messageType || "",
        recipientId: obj.recipientId || "",
        senderId: obj.senderId || "",
        status: obj.status || "",
        timestamp: obj.timestamp || "",
        url: null
      }],
    }
  }
}
