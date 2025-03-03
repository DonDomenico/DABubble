import { inject, Injectable } from '@angular/core';
import { DirectMessage } from '../interfaces/directMessage.interface';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  query,
  getDocs,
  onSnapshot,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ConversationsService {
  currentConversationId: string | undefined;
  firestore = inject(Firestore);
  conversationExists: boolean = false;
  conversations: any[] = [];
  unsubConversations: any;

  constructor() {
    // this.getConversations();
  }
  
  ngOnInit() {
    // this.unsubConversations = this.subConversations();
  }

  ngOnDestroy() {
    // this.unsubConversations();
  }

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
      if ((doc.data()['members'][0] === senderId && doc.data()['members'][1] === recipientId) || (doc.data()['members'][1] === senderId && doc.data()['members'][0] === recipientId)) {
        this.conversationExists = true;
        this.currentConversationId = doc.id;
      }
    });
  }

  async addNewConversationMessage(newDirectMessage: DirectMessage) {
    addDoc(
      collection(this.firestore, `conversations/${this.currentConversationId}/messages`),
      {
        initiatedBy: newDirectMessage.initiatedBy,
        senderAvatar: newDirectMessage.senderAvatar,
        recipientId: newDirectMessage.recipientId,
        recipientAvatar: newDirectMessage.recipientAvatar,
        senderMessage: newDirectMessage.senderMessage,
        timestamp: newDirectMessage.timestamp
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
    return collection(this.firestore, `conversations/${conversationId}/messages`);
  }

  // subConversations() {
  //   return onSnapshot(this.getConversationsRef(), conversationList => {
  //     this.conversations = [];
  //     conversationList.forEach(doc => {
  //       this.conversations.push(this.toJsonConversations(doc.data()));
  //     })
  //     console.log('Conversations: ', this.conversations);
  //   })
  // }

  async getConversations() {
    this.conversations = [];
    const q = query(collection(this.firestore, 'conversations'));
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => {
      this.conversations.push(this.toJsonConversations(doc.data()));
    })
    console.log(this.conversations);
  }


  toJsonConversations(obj: any) {
    return {
      members: obj.members
    }
  }
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
