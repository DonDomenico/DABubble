import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogModule,
} from '@angular/material/dialog';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { DirectMessage } from '../../interfaces/directMessage.interface';
import { Message } from '../../interfaces/message.interface';
import { User } from '../../users/user.interface';
import { UpdateChannelDialogComponent } from '../update-channel-dialog/update-channel-dialog.component';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../interfaces/channel.interface';
import { ActivatedRoute } from '@angular/router';
import { ConversationsService } from '../../services/conversations.service';
import {
  addDoc,
  doc,
  documentId,
  Firestore,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { collection, where } from '@angular/fire/firestore';
import { UserService } from '../../services/users.service';
import { AuthenticationService } from '../../services/authentication.service';
import { TooltipPosition, MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-single-channel',
  standalone: true,
  imports: [FormsModule, MatIconModule, CommonModule, MatDialogModule, MatTooltipModule],
  templateUrl: './single-channel.component.html',
  styleUrl: './single-channel.component.scss',
})
export class SingleChannelComponent implements OnInit, OnDestroy {
  conversationList: DirectMessage[] = [];
  message = '';
  channelId: string = '';
  currentChannel: any;
  channelMembers: any = [];
  memberInfos: any = [];
  unsubSingleChannel: any;
  unsubMemberInfos: any;
  unsubChannelChat: any;
  unsubChannels: any;

  constructor(
    private authService: AuthenticationService,
    private conversationService: ConversationsService,
    public channelService: ChannelService,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private userService: UserService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.route.children[0].params.subscribe(async (params) => {
      this.channelMembers = [];
      this.memberInfos = [];
      this.channelService.messages = [];
      console.log(params); //Testcode, später löschen
      this.channelId = params['id'];
      console.log(this.channelId); //Testcode, später löschen
      await this.getChannelMembers();
      await this.channelService.getChannelChats(this.channelId);
      this.unsubSingleChannel = this.subSingleChannel();
      this.unsubMemberInfos = this.subMemberInfos();
      this.unsubChannelChat = this.channelService.subChannelChat(this.channelId);
    });
  }

  ngOnDestroy() {
    this.unsubSingleChannel();
    this.unsubMemberInfos();
    this.unsubChannelChat();
  }

  getChannelList(): Channel[] {
    return this.channelService.channels;
  }

  getSingleChannel(): Channel | undefined {
    if (this.channelId != undefined) {
      return this.channelService.channels.find((item) => {
        return item.docId == this.channelId;
      });
    } else {
      return this.channelService.channels[0];
    }
  }

  async getChannelMembers() {
    const q = query(
      collection(this.firestore, 'channels'),
      where(documentId(), '==', this.channelId)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      doc.data()['member'].forEach((member: User) => {
        this.channelMembers.push(member);
      });
    });
    console.log('Channel members: ', this.channelMembers); //Testcode, später löschen
  }

  subSingleChannel() {
    return onSnapshot(doc(this.firestore, 'channels', this.channelId), (channel) => {
      console.log(channel.data());
      this.channelMembers = [];
      channel.data()!['member'].forEach((member: User) => {
        this.channelMembers.push(member);
      });
      console.log(this.channelMembers);
    });
  }

  subMemberInfos() {
    const q = query(
      collection(this.firestore, 'users'),
      where('uid', 'in', this.channelMembers)
    );
    return onSnapshot(q, (snapshot) => {
      this.memberInfos = [];
      snapshot.forEach((doc) => {
        this.memberInfos.push(doc.data());
      });
      console.log(this.memberInfos);
    });
  }

  // getConversationList(): Conversation[] {
  //   return this.conversations;
  // }

  addMessage() {
    const newMessage: Message = {
      channelId: this.channelId,
      userName: this.authService.currentUser?.displayName!,
      userAvatar: this.authService.currentUser?.photoURL!,
      userMessage: this.message,
      userTime: new Date().toLocaleTimeString(),
      messageDate: new Date().toLocaleDateString(),
      answer: '',
      lastAnswerTime: '',
      isRowReverse: false,
    };
    this.channelService.addText(newMessage);
    this.message = '';
  }

  updateChannel(channelId: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      channelId: channelId,
    };
    this.dialog.open(UpdateChannelDialogComponent, dialogConfig);
  }

  addMemberDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      channelId: this.channelId,
    };

    this.dialog.open(AddMemberDialogComponent, dialogConfig);
  }
}
