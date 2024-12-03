import { inject, Injectable } from '@angular/core';
import { UserService } from './users.service';
import { ChannelService } from './channel.service';
import { Channel } from '../interfaces/channel.interface';
import { Conversation } from '../interfaces/conversation';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  userService = inject(UserService);
  channelService = inject(ChannelService);
  searchText: string = "";
  searchResults: Channel[] = [];

  constructor() { }

  async search() {
    if(this.searchText !== "") {
      await this.searchChannels();
      console.log("Channels found: ", this.searchResults);
    } else if(this.searchText === "") {
      this.searchResults = [];
    }
  }

  async searchChannels() {
    this.searchResults = [];

    for (let index = 0; index < this.channelService.channels.length; index++) {
      const channel = this.channelService.channels[index];

      if (channel.description.includes(this.searchText) || channel.name.includes(this.searchText)) {
        this.searchResults.push(channel);
      }
    }
  }

  openDropdownMenu() {

  }
}
