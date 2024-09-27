import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { onSnapshot } from "firebase/firestore";
import { addDoc, collection, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel.interface';
@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  firestore = inject(Firestore);

  channels: Channel[] = [];
  // private channelNameSource = new BehaviorSubject<string>('');
  // currentChannelName = this.channelNameSource.asObservable();

  // changeChannelName(name: string) {
  //   this.channelNameSource.next(name);
  // }

  unsubChannelList;

  constructor() {
    this.unsubChannelList = this.subChannelList();
  }

  ngOnDestroy() {
    this.unsubChannelList();
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
      docId: id,
      name: obj.name,
      description: obj.description,
      owner: obj.owner,
    };
  }

  getChannelRef() {
    return collection(this.firestore, "channels");
  }
}
