import { inject, Injectable } from '@angular/core';
import { DirectMessage } from '../interfaces/directMessage.interface';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  query,
  getDocs,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ConversationsService {
  unsubConversations: any;
  currentConversationId: string | undefined;
  firestore = inject(Firestore);
  conversationExists: boolean = false;
  // conversations: Conversation[] = [];

  constructor() { }

  async addNewConversation(senderId: string, recipientId: string) {
    await addDoc(this.getConversationsRef(), {
      members: [senderId, recipientId],
    }).then((doc) => {
      this.currentConversationId = doc.id;
      console.log('Conversation added to database');
    });
  }

  async checkConversationExists(senderId: string, recipientId: string) {
    const q = query(this.getConversationsRef());
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(doc => {
      if (doc.data()['members'].includes(senderId) && doc.data()['members'].includes(recipientId)) {
        this.conversationExists = true;
        this.currentConversationId = doc.id;
      }
    });
  }

  addNewConversationMessage(newDirectMessage: DirectMessage) {
    addDoc(
      collection(this.firestore, `conversations/${this.currentConversationId}/messages`),
      {
        initiatedBy: newDirectMessage.initiatedBy,
        senderAvatar: newDirectMessage.senderAvatar,
        recipientId: newDirectMessage.recipientId,
        recipientAvatar: newDirectMessage.recipientAvatar,
        senderMessage: newDirectMessage.senderMessage,
        timestamp: newDirectMessage.timestamp,
        messageDate: newDirectMessage.messageDate,
      }
    );
  }

  getConversationsRef() {
    return collection(this.firestore, 'conversations');
  }

  getSingleConversationRef(conversationId: string) {
    return doc(this.getConversationsRef(), conversationId);
  }

  // getConversationMessagesRef(conversationId: string) {
  //   return collection(this.getConversationsRef(), conversationId, 'messages');
  //   // return collection(this.firestore, `conversations/${ this.currentConversationId}/messages`);
  // }

  

  // toJsonDirectMessage(obj: any): DirectMessage {
  //   return {
  //     initiatedBy: obj.initiatedBy || '',
  //     senderAvatar: obj.senderAvatar || '',
  //     recipientAvatar: obj.recipientAvatar || '',
  //     recipientId: obj.recipientId || '',
  //     senderMessage: obj.senderMessage || '',
  //     timestamp: obj.timestamp || '',
  //     messageDate: obj.messageDate || '',
  //   };
  // }
}
