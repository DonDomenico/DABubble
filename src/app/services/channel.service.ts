import { Injectable, inject } from '@angular/core';
import { onSnapshot } from "firebase/firestore";
import { addDoc, collection, doc, Firestore, updateDoc, where } from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel.interface';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  firestore = inject(Firestore);

  channels: Channel[] = [];

  // channels: Map<string, Channel> = new Map();
  docRefId = "";

  unsubChannelList;

  constructor() {
    this.unsubChannelList = this.subChannelList();
  }

  ngOnDestroy() {
    this.unsubChannelList();
  }

  async saveChannel(name: string, description: string, ownerId: string, member: string[]) {
    await addDoc(collection(this.firestore, "channels"), {
      name: name,
      description: description,
      owner: ownerId,
      member: [ownerId]
    }).then((docRef) => {
      console.log('Channel added to database');
      this.docRefId = docRef.id;
    }).catch((err) => {
      console.error(err)
    })
  }

  subChannelList() {
    return onSnapshot(this.getChannelRef(), channelList => {
      this.channels = [];
      channelList.forEach(channel => {
        console.log(this.toJson(channel.data(), channel.id));
        this.channels.push(this.toJson(channel.data(), channel.id));
      })
    })
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

  getChannelRef() {
    return collection(this.firestore, "channels");
  }
}
