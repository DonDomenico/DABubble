import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {
  CommonModule,
  DATE_PIPE_DEFAULT_OPTIONS,
  DatePipe,
} from '@angular/common';
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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-single-channel',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    CommonModule,
    MatDialogModule,
    MatTooltipModule,
    DatePipe,
    PickerModule,
    RouterModule
  ],
  templateUrl: './single-channel.component.html',
  styleUrl: './single-channel.component.scss',
  providers: [
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: 'dd.MM.yyyy' },
    },
  ],
})
export class SingleChannelComponent implements OnInit, OnDestroy {
  [x: string]: any;
  conversationList: DirectMessage[] = [];
  message = '';
  messageEmpty: boolean = false;
  currentChannel: any;
  unsubSingleChannel: any;
  unsubMemberInfos: any;
  unsubChannelChat: any;
  unsubChannels: any;
  showEmojiPicker: boolean = false;
  showThread = false;
  messageId: string = '';
  dataLoaded: boolean = false;
  @ViewChild('messagesContainer') private messagesContainer: ElementRef | undefined;

  constructor(
    private authService: AuthenticationService,
    public channelService: ChannelService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.route.children[0].params.subscribe(async (params) => {
      this.channelService.channelMembers = [];
      this.channelService.memberInfos = [];
      this.channelService.messages = [];
      console.log(params); //Testcode, später löschen
      this.channelService.channelId = params['id'];
      console.log(this.channelService.channelId); //Testcode, später löschen
      await this.channelService.getChannelMembers(this.channelService.channelId);
      await this.getChannelChats(this.channelService.channelId);
      this.unsubSingleChannel = this.channelService.subSingleChannel(this.channelService.channelId);
      this.unsubMemberInfos = this.channelService.subMemberInfos();
      this.unsubChannelChat = this.subChannelChat(this.channelService.channelId);
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
    if (this.channelService.channelId !== undefined) {
      return this.channelService.channels.find((item) => {
        return item.docId == this.channelService.channelId;
      });
    } else {
      return this.channelService.channels[0];
    }
  }

  async getChannelChats(channelId: string) {
    this.channelService.messages = [];
    const q = query(collection(this.channelService.firestore, `channels/${channelId}/chatText`), orderBy('userTimestamp'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      this.channelService.messages.push(this.channelService.toJsonText(doc.data(), doc.id));
    });
    console.log('Channel message: ', this.channelService.messages); //Testcode, später löschen
    this.dataLoaded = true;
    this.cdRef.detectChanges();
    this.scrollToBottom();
  }

  subChannelChat(channelId: string) {
    const channelRef = this.channelService.getChannelChatRef(channelId);
    const q = query(channelRef, orderBy('userTimestamp'));
    return onSnapshot(q, (list: any) => {
      this.channelService.messages = [];
      list.forEach((doc: any) => {
        this.channelService.messages.push(this.channelService.toJsonText(doc.data(), doc.id));
      });
      this.cdRef.detectChanges();
      this.scrollToBottom();
      console.log('CHAT TEXT', this.channelService.messages);
    });
  }

  addMessage() {
    if(this.message !== "") {
      const newMessage: Message = {
        channelId: this.channelService.channelId,
        userName: this.authService.currentUser?.displayName!,
        userAvatar: this.authService.currentUser?.photoURL!,
        userMessage: this.message,
        timestamp: new Date().getTime(),
        docId: this.messageId,
      };
      this.channelService.addText(newMessage);
      this.message = '';
      this.messageEmpty = false;
    } else {
      this.messageEmpty = true;
    }
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
      channelId: this.channelService.channelId,
    };

    this.dialog.open(AddMemberDialogComponent, dialogConfig);
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    const { message } = this;
    const text = `${message}${event.emoji.native}`;
    this.message = text;
  }

  onFocus() {
    this.showEmojiPicker = false;
  }

  isDifferentDay(index: number) {
    if (index === 0) {
      return true; // Datum der ersten Nachricht immer anzeigen
    }
    const currentMessageDate = new Date(this.channelService.messages[index].timestamp);
    const previousMessageDate = new Date(this.channelService.messages[index - 1].timestamp);

    // Vergleiche nur das Datum, nicht die Uhrzeit
    const isSameDay = currentMessageDate.toLocaleDateString() === previousMessageDate.toLocaleDateString();

    return !isSameDay; // Zeige Datum nur an, wenn der Tag anders ist
  }

  private scrollToBottom(): void {
    if (this.messagesContainer && this.messagesContainer.nativeElement) {
      this.renderer.setProperty(this.messagesContainer.nativeElement, 'scrollTop', this.messagesContainer.nativeElement.scrollHeight);
    }
  }
}
