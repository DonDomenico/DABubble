import { inject, Injectable } from '@angular/core';
import { Conversation } from '../interfaces/conversation';
import { collection, doc, Firestore, onSnapshot } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ConversationsService {
  unsubConversations;
  firestore = inject(Firestore);
  conversations: Conversation[] = [];

  constructor() { 
    this.unsubConversations = this.subConversations();
  }

  ngOnDestroy() {
    this.unsubConversations();
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
