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
  orderBy,
  where,
  and,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class ConversationsService {
  currentConversationId: string | undefined;
  firestore = inject(Firestore);
  auth = inject(Auth);
  conversationExists: boolean = false;
  conversations: any[] = [];
  conversationMessages: DirectMessage[] = [];
  newMessages: { conversationId: string, messages: DirectMessage[] }[] = [];
  unsubConversations: any;
  unsubNewMessages: any;

  constructor() {
    // setTimeout(() => {
    //   this.unsubNewMessages = this.subNewMessages();
    // }, 1000);
    // setTimeout(() => {
    //   this.testFn();
    // }, 1500);
  }

  testFn() {
    for (const message of this.newMessages) {
      for (const conversation of this.conversations) {
        if (conversation.members.includes("hBEeS6IqIUb8QIlkviFuIqcowNl1") && message.conversationId === conversation.docId && message.messages.length > 0) {
          console.log(`New Messages in conversation ${conversation.docId}: `, message.messages)
        }
      }
    }
  }

  subConversations() {
    return onSnapshot(query(this.getConversationsRef(), where('members', 'array-contains', this.auth.currentUser?.uid)), conversations => {
      conversations.forEach(conversation => {
        this.conversations.push(conversation);
      })
    })
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
    const q = query(this.getConversationsRef(), where('members', 'array-contains', this.auth.currentUser?.uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(doc => {
      if ((doc.data()['members'][0] === senderId && doc.data()['members'][1] === recipientId) || (doc.data()['members'][1] === senderId && doc.data()['members'][0] === recipientId)) {
        this.conversationExists = true;
        this.currentConversationId = doc.id;
      }
    });
  }

  subNewMessages() {
    this.conversations.forEach(conversation => {
      this.newMessages = [];
      return onSnapshot(query(this.getConversationMessagesRef(conversation.docId), where('read', '==', false), where('initiatedBy', '==', this.auth.currentUser?.displayName)), newMessagesList => {
        const conversationId = conversation.docId;
        newMessagesList.docs.forEach((message, index) => {
          if (this.newMessages.length > 0 && this.newMessages.find(message => message.conversationId === conversationId)) {
            const messageIndex = this.newMessages.findIndex(message => message.conversationId === conversationId);
            this.newMessages[messageIndex].messages.push(this.toJsonDirectMessage(message.data(), message.id));
          } else {
            this.newMessages.push({ 'conversationId': conversationId, 'messages': [this.toJsonDirectMessage(message.data(), message.id)] });
          }
        })
      })
    })
  }

  async getConversationMessages(conversationId: string) {
    this.conversationMessages = [];
    const q = query(this.getConversationMessagesRef(conversationId), orderBy("timestamp"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      this.conversationMessages.push(this.toJsonDirectMessage(doc.data(), doc.id));
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
        timestamp: newDirectMessage.timestamp,
        read: newDirectMessage.read
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
    return collection(this.firestore, `conversations/${conversationId}/messages`);
  }

  async getConversations() {
    this.conversations = [];
    const q = query(this.getConversationsRef(), where('members', 'array-contains', this.auth.currentUser?.uid));
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => {
      this.conversations.push(this.toJsonConversations(doc.data(), doc.id));
    })
    console.log(this.conversations);
  }

  toJsonConversations(obj: any, id: string) {
    return {
      members: obj.members,
      docId: id
    }
  }

  toJsonDirectMessage(obj: any, id: string): DirectMessage {
    return {
      initiatedBy: obj.initiatedBy || '',
      senderAvatar: obj.senderAvatar || '',
      recipientAvatar: obj.recipientAvatar || '',
      recipientId: obj.recipientId || '',
      senderMessage: obj.senderMessage || '',
      timestamp: obj.timestamp || '',
      emojiReactions: obj.emojiReactions || [],
      docId: id,
      edited: !!(obj.edited),
      read: obj.read
    };
  }
}
