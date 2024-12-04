import { inject, Injectable } from '@angular/core';
import { Conversation } from '../interfaces/conversation';
import { addDoc, setDoc, collection, doc, Firestore, onSnapshot, query } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ConversationsService {
  

  unsubConversations: any;

  firestore = inject(Firestore);
  conversations: Conversation[] = [];

  constructor() { 
    this.unsubConversations = this.subConversations();

  }

  ngOnDestroy() {
    this.unsubConversations();
 
  }

  addNewConversation(newConversation: Conversation) {
    addDoc(
      collection(this.firestore, 'conversations'),

      {
      // docId: newConversation.docId,
      initiatedBy: newConversation.initiatedBy,
      senderAvatar: newConversation.senderAvatar,
      recipientId: newConversation.recipientId,
      recipientAvatar: newConversation.recipientAvatar,
      senderMessage: newConversation.senderMessage,
      timestamp: newConversation.timestamp,
      messageDate: newConversation.messageDate,
      }
    );
  }

  // subConversationMessages(conversationId: string) {
  //   const conversationRef = collection(this.firestore, `conversations/${conversationId}/messages`);
  //   const q = query(conversationRef);
  //   return onSnapshot( q, (messageList: any) => {
  //     this.conversations = [];
  //     messageList.forEach((doc: any) => {
  //       this.conversations.push(this.toJsonConversation(doc.data(), doc.id));
  //       console.log('JUHU', this.conversations);
  //     })
  //   })
  // }

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
      // docId: id || "",
      initiatedBy: obj.initiatedBy || "",
      senderAvatar: obj.senderAvatar || "",
      recipientAvatar: obj.recipientAvatar || "",
      recipientId: obj.recipientId || "",
        senderMessage: obj.senderMessage || "",
        timestamp: obj.timestamp || "",
        messageDate: obj.messageDate || "",
    }
  
  }

  // toJsonConversationMessage(obj: any) {
  //   return {
  //     message: obj.message || "",
  //     messageType: obj.messageType || "",
  //     recipientId: obj.recipientId || "",
  //     senderId: obj.senderId || "",
  //     status: obj.status || "",
  //     timestamp: obj.timestamp || "",
  //     url: null
  //   }
  // }

}
