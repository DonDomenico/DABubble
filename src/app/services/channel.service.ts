import { Injectable, OnDestroy, inject } from '@angular/core';
import { getDoc, getDocs, limit, onSnapshot, query } from 'firebase/firestore';
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
  unsubChannelList: any;
  messages: Message[] = [];
  constructor() {
    this.unsubChannelList = this.subChannelList();
  }

  ngOnDestroy() {
    this.unsubChannelList();
  }

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

  

  addText(message: Message) {
    addDoc(
      collection(this.firestore, `channels/${message.channelId}/chatText`),

      {
        userName: message.userName,
        userAvatar: message.userAvatar,
        userMessage: message.userMessage,
        userTime: message.userTime,
        answer: '',
        lastAnswerTime: '',
        isRowReverse: false,
      }
    );
  }
  subChannelChat(channelId: string) {
    const channelRef = 
    // collection(this.firestore,'channels/HINU2bSnAba9Kzv0IMyQ/chatText');
          collection(this.firestore, `channels/${channelId}/chatText`);
    const q = query(channelRef);
    return onSnapshot(q, (list: any) => {
      this.messages = [];
      list.forEach((doc: any) => {
        this.messages.push(this.toJsonText(doc.data(), doc.id));
        console.log('CHAT TEXT', this.messages);
      });
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
