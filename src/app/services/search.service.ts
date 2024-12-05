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

      if (channel.description.toLowerCase().includes(this.searchText.toLowerCase()) || channel.name.toLowerCase().includes(this.searchText.toLowerCase())) {
        this.searchResults.push(channel);
        continue;
      } else {
        await this.searchChannelText(channel);
      }
    }
  }

  async searchChannelText(channel: Channel) {
    await this.channelService.getChannelChats(channel.id);

    for (let index = 0; index < this.channelService.messages.length; index++) {
      const message = this.channelService.messages[index];
      
      if(message.userMessage.toLowerCase().includes(this.searchText.toLowerCase())) {
        this.searchResults.push(channel);
        break;
      }
    }
  }

  openDropdownMenu() {

  }
}
