import { Component, Output, EventEmitter, ViewChild, Inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChannelService } from '../services/channel.service';
import { Channel } from '../interfaces/channel.interface';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Firestore, getDoc, doc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Message } from '../interfaces/message.interface';
import { DATE_PIPE_DEFAULT_OPTIONS, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { Thread } from '../interfaces/thread.interface';


@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MatDialogModule, MatIcon, DatePipe, FormsModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
   providers: [
      {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: "dd.MM.yyyy" }
    }]
})
export class ThreadComponent {

  @Output() toggleThread: EventEmitter<any> = new EventEmitter();
  channelId: string = '';
  messageId: string = '';
  channel: Channel | undefined;
  channelName: string = '';
  messages: Message[] = [];
  answer = '';
  unsubChannelChat: any;
  
  constructor(
    public channelService: ChannelService,
    private authService: AuthenticationService,
    // public dialog: MatDialog,
     private route: ActivatedRoute,
    private firestore: Firestore
  ) {}

  isThreadcolses = false;

  
  async ngOnInit() {
    this.route.children[0].params.subscribe(async (params) => {
      this.channelId = params['id'] || '';
      this.messageId = params['messageId'];
      this.channel = await this.getSingleChannel();
      // await this.channelService.getThreadChatRef(this.channelId, this.threadId);
      this.channelService.messages = [];
      await this.channelService.getChannelChats(this.channelId);
      this.unsubChannelChat = this.channelService.subChannelChat(this.channelId);
});


  }

  ngOnDestroy() {
    this.unsubChannelChat();
  }

  async getSingleChannel(): Promise<Channel | undefined> {
    if (this.channelId != undefined) {
      const channelRef = this.channelService.getSingleChannelRef(
        this.channelId
      );
      const channelSnapshot = await getDoc(channelRef);
      if (channelSnapshot.exists()) {
        return this.channelService.toJson(
          channelSnapshot.data(),
          channelSnapshot.id
        );
      } else {
        console.log('No such document!');
        return undefined;
      }
    } else {
      return this.channelService.channels[0];
    }
  }

  // get message that was clicked

// async getThreadMessage() {

//     const messageRef = this.channelService.getThreadChatRef(this.channelId, this.threadId);
//     const messageSnapshot = await getDoc(messageRef);
//     if (messageSnapshot.exists()) {
//       return this.channelService.toJsonText(messageSnapshot.data(), messageSnapshot.id);
//     } else {
//       console.log('No such document!');
//       return undefined;
//     }
  
// }

  addAnswer() {
    const newAnswer: Thread = {
      userName: this.authService.currentUser?.displayName!,
      userAvatar: this.authService.currentUser?.photoURL!,
      userMessage: this.answer,
      timestamp: new Date().getTime(),
   
    };
    this.channelService.addAnswer(newAnswer);
    this.answer = '';
  }


  closeThread() {
  //  this.isThreadHidden = !this.isThreadHidden;
   this.toggleThread.emit(this.isThreadcolses);

  }
}
