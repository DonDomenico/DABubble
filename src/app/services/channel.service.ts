import { Injectable, inject } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  documentId,
  Firestore,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel.interface';
import { Message } from '../interfaces/message.interface';
import { User } from '../users/user.interface';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  firestore = inject(Firestore);
  authService = inject(AuthenticationService);
  channels: Channel[] = [];
  messages: Message[] = [];
  channelMembers: any = [];
  memberInfos: any[] = [];
  channelId: string = '';
  isThreadHidden: boolean = true;
  threadId: string = '';
  hideSingleChannel: boolean = false;
  isMobile: boolean = false;

  constructor() { }

  async saveChannel(
    name: string,
    description: string,
    ownerId: string,
    member: string[]
  ) {
    await addDoc(collection(this.firestore, 'channels'), {
      name: name,
      description: description,
      owner: ownerId,
      member: member,
    })
  }

  getSingleChannelRef(channelId: string) {
    return doc(collection(this.firestore, 'channels'), channelId);
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  getChannelChatRef(channelId: string) {
    return collection(this.firestore, `channels/${channelId}/chatText`);
  }

  async getThreadChatRef(channelId: string, threadId: string) {
    return doc(this.firestore, `channels/${channelId}/chatText/${threadId}`);
  }

  addText(message: Message) {
    addDoc(
      collection(this.firestore, `channels/${message.channelId}/chatText`),
      {
        userName: message.userName,
        userAvatar: message.userAvatar,
        userMessage: message.userMessage,
        userTimestamp: message.timestamp,
        answers: [],
      }
    );
  }

  checkMobile() {
    if (window.innerWidth < 1000) {
      this.isMobile = true;
    }
  }

  showThread() {
    this.checkMobile();
    setTimeout(() => {
      if (this.isThreadHidden && this.isMobile) {
        this.isThreadHidden = false;
        this.hideSingleChannel = true;
      } else {
        this.isThreadHidden = false;
        this.hideSingleChannel = false;
      }
    }, 0);
  }

  async getChannels() {
    this.channels = [];
    const q = query(collection(this.firestore, 'channels'));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      this.channels.push(this.toJsonChannel(doc.data(), doc.id));
    });
  }

  async getChannelMembers(channelId: string) {
    const q = query(
      collection(this.firestore, 'channels'),
      where(documentId(), '==', channelId)
    );

    const querySnapshot = await getDocs(q);
    this.channelMembers = [];
    querySnapshot.forEach((doc) => {
      doc.data()['member'].forEach((member: User) => {
        this.channelMembers.push(member);
      });
    });
  }

  toJsonMessage(obj: any, id: string): Message {
    return {
      userId: id,
      userName: obj.userName || '',
      userAvatar: obj.userAvatar || '',
      userMessage: obj.userMessage || '',
      timestamp: obj.userTimestamp || '',
      answers: obj.answers || [],
      emojiReactions: obj.emojiReactions || [],
      docId: id,
      edited: !!(obj.edited) || false,
    };
  }

  toJsonChannel(
    obj: any,
    id: string,
    description?: any,
    owner?: any,
    member?: any
  ): Channel {
    return {
      id,
      docId: id,
      name: obj.name,
      description: obj.description,
      owner: obj.owner,
      member: obj.member,
    };
  }

  toJsonNewName(
    channel: Channel,
    newChannelName: string,
    description?: string,
    owner?: string,
    member?: string[]
  ): { [key: string]: any } {
    return {
      name: newChannelName,
      description: description || channel.description,
      owner: owner || channel.owner,
      member: member || channel.member,
    };
  }

  toJsonNewDescription(
    channel: Channel,
    name: string,
    newChannelDescription: string,
    owner?: string,
    member?: string[]
  ): { [key: string]: any } {
    return {
      name: name || channel.name,
      description: newChannelDescription,
      owner: owner || channel.owner,
      member: member || channel.member,
    };
  }

  async removeUserFromChannels(userId: string) {
    const q = query(collection(this.firestore, 'channels'), where('member', 'array-contains', userId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(doc => {
      const userIndex = doc.data()['member'].findIndex((id: string) => id === userId);
      this.channelMembers.splice(userIndex, 1);
      updateDoc(this.getSingleChannelRef(this.channelId), {
        member: this.channelMembers
      });
    })
  }
}