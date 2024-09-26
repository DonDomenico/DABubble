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
  docRefId = "";
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

  getConversationRef () {
    return collection(this.firestore, 'conversations');
  }

  getDocRef(uid: string) {
    return doc(this.firestore, "users", uid);
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
        this.docRefId = docRef.id;
      }
    ).catch((err) => { 
      console.error(err) 
      }
    )
  }

  async updateUserPhoto(photoURL: string, docRefId: string) {
    await updateDoc(doc(this.firestore, "users", docRefId), {
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
    return onSnapshot(this.getConversationRef(), conversationList => {
      this.conversations = [];
      conversationList.forEach(conversation => {
        console.log(this.toJson(conversation.data(), conversation.id));
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
      message: obj.message || "",
      messageType: obj.messageType || "",
      recipientId: obj.recipientId || "",
      senderId: obj.senderId || "",
      status: obj.status || "",
      timestamp: obj.timestamp || ""
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
