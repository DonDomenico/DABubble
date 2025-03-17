import { Injectable, inject } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  documentId,
  Firestore,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel.interface';
import { Message } from '../interfaces/message.interface';
import { User } from '../users/user.interface';
import { Router } from '@angular/router';
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
  constructor(private router: Router) { }

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
      .then(() => {
        console.log('Channel added to database');
      })
      .catch((err) => {
        console.error(err);
      });
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
    return doc(collection(this.firestore, 'channels', channelId, 'answers'), threadId);
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
    console.log('WORKS: ', this.channelMembers); //Testcode, später löschen
  }

  // async getChannelChats(channelId: string) {
  //   this.messages = [];
  //   const q = query(
  //     collection(this.firestore, `channels/${channelId}/chatText`),
  //     orderBy('userTimestamp')
  //   );
  //   const querySnapshot = await getDocs(q);
  //   querySnapshot.forEach((doc) => {
  //     this.messages.push(this.toJsonMessage(doc.data(), doc.id));
  //   });
  //   console.log('Channel message: ', this.messages); //Testcode, später löschen
  // }

  // subChannelChat(channelId: string) {
  //   const channelRef = this.getChannelChatRef(channelId);
  //   const q = query(channelRef, orderBy('userTimestamp'));
  //   return onSnapshot(q, (list: any) => {
  //     this.messages = [];
  //     list.forEach((doc: any) => {
  //       this.messages.push(this.toJsonText(doc.data(), doc.id));
  //     });
  //     console.log('CHAT TEXT', this.messages);
  //   });
  // }

  // subChannelList() {
  //   const q = query(this.getChannelRef(), where('member', 'array-contains', this.authService.currentUser.uid));
  //   return onSnapshot(q, (channelList) => {
  //     this.channels = [];
  //     channelList.forEach((channel) => {
  //       console.log(this.toJsonChannel(channel.data(), channel.id)); // später löschen
  //       this.channels.push(this.toJsonChannel(channel.data(), channel.id));
  //     });
  //   });
  // }

  // subSingleChannel(channelId: string) {
  //   return onSnapshot(doc(this.firestore, 'channels', channelId), (channel) => {
  //     console.log(channel.data());
  //     this.channelMembers = [];
  //     channel.data()!['member'].forEach((member: User) => {
  //       this.channelMembers.push(member);
  //     });
  //     console.log(this.channelMembers);
  //   });
  // }

  // subMemberInfos() {
  //   if (this.channelMembers.length !== 0) {
  //     this.memberInfos = [];
  //     const q = query(
  //       collection(this.firestore, 'users'),
  //       where('uid', 'in', this.channelMembers)
  //     );
  //     return onSnapshot(q, (snapshot) => {
  //       snapshot.forEach((doc) => {
  //         this.memberInfos.push(doc.data());
  //       });
  //     });
  //   } else {
  //     return undefined;
  //   }
  // }

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