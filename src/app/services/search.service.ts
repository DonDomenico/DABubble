import { inject, Injectable } from '@angular/core';
import { UserService } from './users.service';
import { ChannelService } from './channel.service';
import { Channel } from '../interfaces/channel.interface';
import { User } from '../users/user.interface';
import { collection, Firestore, getDocs, query } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  userService = inject(UserService);
  channelService = inject(ChannelService);
  firestore = inject(Firestore);
  searchText: string = '';
  searchAll: string = '';
  searchResults: Channel[] = [];
  searchResultsUsers: User[] = [];
  // mobileHeader: boolean = true;
  // logoHeader: boolean = false;
  // isMobile: boolean = false;
  constructor() {}

  async search() {
    if (this.searchText !== '') {
      await this.searchChannels();
      console.log('Channels found: ', this.searchResults);
    } else if (this.searchText === '') {
      this.searchResults = [];
    }
  }

  async searchUsersAndChannels(): Promise<void> {
    if (this.searchAll !== '') {
      if (this.searchAll.startsWith('@')) {
        await this.searchUsers();
      } else if (this.searchAll.startsWith('#')) {
        await this.searchChannelsOnly();
      }
      console.log('Channels found: ', this.searchResults);
      console.log('Users found: ', this.searchResultsUsers);
    } else {
      this.searchResults = [];
      this.searchResultsUsers = [];
    }
  }

  async searchUsersOnly() {
    if (this.searchAll !== '') {
      await this.searchUsers();
      console.log('Users found: ', this.searchResultsUsers);
    } else if (this.searchAll === '') {
      this.searchResultsUsers = [];
    }
  }

  async searchChannels() {
    this.searchResults = [];

    for (let index = 0; index < this.channelService.channels.length; index++) {
      const channel = this.channelService.channels[index];

      if (
        channel.description.toLowerCase().includes(this.searchText.toLowerCase()) ||
        channel.name.toLowerCase().includes(this.searchText.toLowerCase())
      ) {
        this.searchResults.push(channel);
        continue;
      } else {
        await this.searchChannelText(channel);
      }
    }
  }

  async searchChannelsOnly() {
    this.searchResults = [];
    for (let index = 0; index < this.channelService.channels.length; index++) {
      const channel = this.channelService.channels[index];
      const searchText = this.searchAll.slice(1);
      if (channel.name.toLowerCase().includes(searchText.toLowerCase())) {
        this.searchResults.push(channel);
        continue;
      }
    }
  }

  async searchChannelText(channel: Channel) {
    const messages = query(
      collection(this.firestore, `channels/${channel.id}/chatText`)
    );
    const querySnapshot = await getDocs(messages);

    querySnapshot.forEach((message) => {
      if (
        message
          .data()
          ['userMessage'].toLowerCase()
          .includes(this.searchText.toLowerCase())
      ) {
        this.searchResults.push(channel);
      }
    });
  }

  async searchUsers() {
    this.searchResultsUsers = [];

    for (let index = 0; index < this.userService.users.length; index++) {
      const user = this.userService.users[index];
      const searchText = this.searchAll.slice(1);
      if (
        user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
      ) {
        this.searchResultsUsers.push(user);
      }
    }
  }

  // checkMobile() {
  //   if (window.innerWidth < 767) {
  //     this.isMobile = true;
  //   }
  // }
  
  // toggleMobileHeader() {
  //   this.checkMobile();
  //   if(this.isMobile) {
  //     this.mobileHeader = !this.mobileHeader;
  //     this.logoHeader = !this.logoHeader;
  //   }
  // }

}
