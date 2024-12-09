import { inject, Injectable } from '@angular/core';
import { Conversation } from '../interfaces/conversation';
import {
  addDoc,
  setDoc,
  collection,
  doc,
  Firestore,
  onSnapshot,
  query,
  orderBy,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ConversationsService {
  unsubConversations: any;
  currentConversationId: string | undefined;
  firestore = inject(Firestore);
  conversations: Conversation[] = [];

  constructor() {
    // this.unsubConversations = this.subConversations();
  }

  // ngOnDestroy() {
  //   this.unsubConversations();
  // }

  async addNewConversation(senderId: string, recipientId: string) {
    await addDoc(this.getConversationsRef(), {
      members: [senderId, recipientId],
    }).then((doc) => {
      console.log('Conversation added to database');
      this.currentConversationId = doc.id;
    });
  }

  addNewConversationMessage(newConversation: Conversation) {
    
    addDoc(
      collection(
        this.firestore,
        `conversations/${this.currentConversationId}/messages`
      ),
      {
        // id: newConversation.id,
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

  getConversationsRef() {
    return collection(this.firestore, 'conversations');
  }

  getSingleConversationRef(conversationId: string) {
    return doc(this.getConversationsRef(), conversationId);
  }

  getConversationMessagesRef(conversationId: string) {
    // return collection(this.getConversationsRef(), conversationId, 'messages');
    return collection(this.firestore, `conversations/${ this.currentConversationId}/messages`);
  }

  // Möglichkeit finden, an den aktuellen Nutzer heranzukommen
  // queryUserConversations = query(this.getConversationsRef(), where('participants', 'array-contains', this.authService.currentUser?.uid));

  // subConversations() {
  //   return onSnapshot(this.getConversationsRef(), (conversationList) => {
  //     this.conversations = [];
  //     conversationList.forEach((conversation) => {
  //       const currentConversation = conversation.id;
  //       console.log(
  //         this.toJsonConversation(conversation.data(), currentConversation)
  //       );
  //       this.conversations.push(
  //         this.toJsonConversation(conversation.data(), currentConversation)
  //       );
  //     });
  //   });
  // }

  toJsonConversation(obj: any, id?: string): Conversation {
    return {
      id: id || obj.id,
      initiatedBy: obj.initiatedBy || '',
      senderAvatar: obj.senderAvatar || '',
      recipientAvatar: obj.recipientAvatar || '',
      recipientId: obj.recipientId || '',
      senderMessage: obj.senderMessage || '',
      timestamp: obj.timestamp || '',
      messageDate: obj.messageDate || '',
    };
  }
}
