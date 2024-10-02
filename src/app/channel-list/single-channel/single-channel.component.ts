import { Component, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { FirestoreService } from '../../services/firestore.service';
import { Conversation } from '../../interfaces/conversation';
import { Message } from '../../interfaces/message.interface';
import { User } from '../../users/user.interface';
import { UpdateChannelDialogComponent } from '../update-channel-dialog/update-channel-dialog.component';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../interfaces/channel.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-single-channel',
  standalone: true,
  imports: [UpdateChannelDialogComponent, FormsModule, MatIconModule, CommonModule, AddMemberDialogComponent],
  templateUrl: './single-channel.component.html',
  styleUrl: './single-channel.component.scss'
})
export class SingleChannelComponent implements OnInit {
  // channel: Channel [] = [];
  conversationList: Conversation[] = [];
  message = "";
  channelId: string = "";
  currentChannel: Channel | undefined;

  constructor(private conversationService: FirestoreService, private channelService: ChannelService, private route: ActivatedRoute, private router: Router) {
    this.channelId = this.router.getCurrentNavigation()?.extras?.state?.['id'];
    console.log(this.channelId);
  }
  
  ngOnInit(): void {
    this.currentChannel = this.getSingleChannel();
    console.log(this.currentChannel?.name);
    this.updateTimestamp();
    setInterval(() => this.updateTimestamp(), 60000); // Aktualisiert jede Minute
  }

  getChannelList(): Channel[] {
    return this.channelService.channels;
  }

  getSingleChannel() {
    if(this.channelId != undefined) {
      return this.channelService.channels.find(item => {
        return item.docId == this.channelId;
      });
    } else {
      return this.channelService.channels[0];
    }
  }

  getConversationList(): Conversation[] {
    return this.conversationService.conversations;
  }

  addMessage() {
    // let message = {
    //   initiatedAt: string;
    //   initiatedBy: string;
    // }
    this.conversationService
  }

  messages: Message[] = [
    {
      userName: "Noah Braun",
      userAvatar: "./assets/img/avatar4.svg",
      userMessage: "Welche Version ist aktuell von Angular?",
      userTime: "12:00 Uhr",
      answer: "2 Antworten",
      lastAnswerTime: "Letzte Antwort 14:56",
      isRowReverse: false
    },
    {
      userName: "Frederik Beck",
      userAvatar: "./assets/img/avatar3.svg",
      userMessage: "Die aktuellste stabile Version von Angular ist Angular 16, die im Mai 2023 veröffentlicht wurde. Diese Version bringt viele neue Features und Verbesserungen mit sich, darunter optimierte Leistung, verbesserte Entwicklerwerkzeuge und neue APIs.",
      userTime: "15:06 Uhr",
      answer: "",
      lastAnswerTime: "",
      isRowReverse: true
    },
  ]

  timestamp!: string;
  readonly dialog = inject(MatDialog);

  messageDate: string = new Date().toLocaleTimeString();

  updateTimestamp(): void {
    const now = new Date();
    const today = new Date().setHours(0, 0, 0, 0);
    const messageDate = now.setHours(0, 0, 0, 0);

    if (messageDate === today) {
      this.timestamp = 'Heute';
    } else {
      this.timestamp = now.toLocaleDateString();
  
    }
  }

  // sendMessage() {
  //   const now = new Date();
  //   const today = new Date().setHours(0, 0, 0, 0);
  //   const messageDate = now.setHours(0, 0, 0, 0);

  //   if (messageDate === today) {
  //     this.timestamp = 'Heute';
  //   } else {
  //     this.timestamp = now.toLocaleDateString();
  //   }
  // }

  updateChannel() {
    this.dialog.open(UpdateChannelDialogComponent);
  }
  addMemberDialog() {
    this.dialog.open(AddMemberDialogComponent);
  }
}
