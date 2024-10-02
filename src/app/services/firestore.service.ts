import { inject, Injectable } from '@angular/core';
import { onSnapshot } from "firebase/firestore";
import { addDoc, collection, doc, Firestore, query, updateDoc, where } from '@angular/fire/firestore';
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
  unsubConversations;

  constructor() { 
    this.unsubUserList = this.subUserList();
    this.unsubConversations = this.subConversations();
  }

  ngOnDestroy() {
    this.unsubUserList();
    this.unsubConversations();
  }

  getUserRef() {
    return collection(this.firestore, 'users');
  }

  getSingleUserRef(uid: string) {
    return doc(this.getUserRef(), uid);
  }

  getConversationsRef () {
    return collection(this.firestore, 'conversations');
  }

  getSingleConversationRef(conversationId: string) {
    return doc(this.getConversationsRef(), conversationId);
  }

  getConversationMessagesRef(conversationId: string) {
    return collection(this.getConversationsRef(), conversationId, 'messages');
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

  subConversations() {
    return onSnapshot(this.getConversationsRef(), conversationList => {
      this.conversations = [];
      conversationList.forEach(conversation => {
        const currentConversation = conversation.id;
        console.log(this.toJsonConversation(conversation.data(), currentConversation));
        this.conversations.push(this.toJsonConversation(conversation.data(), currentConversation));
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
      messages: []
    }
  }

  toJsonConversationMessage(obj: any) {
    return {
      message: obj.message || "",
      messageType: obj.messageType || "",
      recipientId: obj.recipientId || "",
      senderId: obj.senderId || "",
      status: obj.status || "",
      timestamp: obj.timestamp || "",
      url: null
    }
  }
}
