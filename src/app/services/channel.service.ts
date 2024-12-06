import { Injectable, OnDestroy, inject } from '@angular/core';
import { getDoc, getDocs, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  addDoc,
  collection,
  doc,
  documentId,
  Firestore,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel.interface';
import { Message } from '../interfaces/message.interface';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  firestore = inject(Firestore);
  channels: Channel[] = [];
  messages: Message[] = [];

  constructor() {}

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
      member: [ownerId],
    })
      .then(() => {
        console.log('Channel added to database');
      })
      .catch((err) => {
        console.error(err);
      });
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  getChannelChatRef(channelId: string) {
    return collection(this.firestore, `channels/${channelId}/chatText`);
  }

  addText(message: Message) {
    addDoc(
      collection(this.firestore, `channels/${message.channelId}/chatText`),
      {
        userName: message.userName,
        userAvatar: message.userAvatar,
        userMessage: message.userMessage,
        userTime: message.userTime,
        messageDate: message.messageDate,
        answer: '',
        lastAnswerTime: '',
        isRowReverse: false,
      }
    );
  }

  async getChannels() {
    this.channels = [];
    const q = query(collection(this.firestore, 'channels'));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      this.channels.push(this.toJson(doc.data(), doc.id));
    })
  }

  async getChannelChats(channelId: string) {
    this.messages = [];
    const q = query(collection(this.firestore, `channels/${channelId}/chatText`), orderBy('messageDate'), orderBy('userTime'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      this.messages.push(
        this.toJsonText(doc.data(), doc.id)
      );
    });
    console.log('Channel message: ', this.messages); //Testcode, später löschen
  }

  subChannelChat(channelId: string) {
    const channelRef = this.getChannelChatRef(channelId);
    const q = query(channelRef, orderBy('messageDate'), orderBy('userTime'));
    return onSnapshot(q, (list: any) => {
      this.messages = [];
      list.forEach((doc: any) => {
        this.messages.push(this.toJsonText(doc.data(), doc.id));
      });
      console.log('CHAT TEXT', this.messages);
    });
  }

  subChannelList() {
    return onSnapshot(this.getChannelRef(), (channelList) => {
      this.channels = [];
      channelList.forEach((channel) => {
        console.log(this.toJson(channel.data(), channel.id));
        this.channels.push(this.toJson(channel.data(), channel.id));
      });
    });
  }

  toJsonText(obj: any, id: string): Message {
    return {
      userId: id,
      userName: obj.userName || '',
      userAvatar: obj.userAvatar || '',
      userMessage: obj.userMessage || '',
      userTime: obj.userTime || '',
      messageDate: obj.messageDate || '',
      answer: obj.answer || '',
    };
  }

  toJson(obj: any, id: string): Channel {
    return {
      id,
      docId: id,
      name: obj.name,
      description: obj.description,
      owner: obj.owner,
      member: obj.member,
    };
  }
}
