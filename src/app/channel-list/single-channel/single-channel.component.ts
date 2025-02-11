import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
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
import { ShowMembersDialogComponent } from '../show-members-dialog/show-members-dialog.component';

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
  showEmojiPickerReaction: Map<string, boolean> = new Map();
  emojiReactions: (any | any)[] = [];
  emojiCounter: number = 0;
  messageId: string = '';
  dataLoaded: boolean = false;
  routeSubscription: any;
  @ViewChild('messagesContainer') private messagesContainer: ElementRef | undefined;
  @ViewChild('emojiPicker') private emojiPickerElement: ElementRef | undefined;
  @ViewChild('emojiPickerReaction') private emojiPickerReactionElement: ElementRef | undefined;
  @ViewChild('messageBoxContainer') private messageBoxContainer: ElementRef | undefined;

  constructor(
    private authService: AuthenticationService,
    public channelService: ChannelService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.routeSubscription = this.route.children[0].params.subscribe(async (params) => {
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
    this.routeSubscription.unsubscribe();
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
      this.channelService.messages.push(this.channelService.toJsonMessage(doc.data(), doc.id));
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
        this.channelService.messages.push(this.channelService.toJsonMessage(doc.data(), doc.id));
      });
      this.cdRef.detectChanges();
      this.scrollToBottom();
      console.log('CHAT TEXT', this.channelService.messages);
    });
  }

  addMessage() {
    if (this.message !== "") {
      const newMessage: Message = {
        channelId: this.channelService.channelId,
        userName: this.authService.currentUser?.displayName!,
        userAvatar: this.authService.currentUser?.photoURL!,
        userMessage: this.message,
        timestamp: new Date().getTime(),
        answers: [],
        emojiReactions: [{ emoji: '', counter: 0, users: [] }],
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

  showMembersDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      channelId: this.channelService.channelId,
    };

    this.dialog.open(ShowMembersDialogComponent, dialogConfig);
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  toggleEmojiPickerReaction(messageId: string) {
    const currentState = this.showEmojiPickerReaction.get(messageId) || false;
    this.showEmojiPickerReaction.set(messageId, !currentState);
  }

  addEmoji(event: any) {
    const { message } = this;
    const text = `${message}${event.emoji.native}`;
    this.message = text;
    this.showEmojiPicker = false;
  }

  // async addEmojiReaction(event: any, messageId: string) {
  //   this.emojiReactions = await this.getEmojiReactions(messageId);
  //   const emoji = event.emoji.native;
  //   let emojiInReactions = this.emojiReactions.find(element => emoji === element['emoji']);

  //   if(emojiInReactions) {
  //     let index = this.emojiReactions.map(element => element.emoji).indexOf(emoji);
  //     if(!this.emojiReactions[index]['users'].includes(this.authService.currentUser.displayName)) {
  //       this.emojiReactions[index]['counter']++;
  //       this.emojiReactions[index].users.push(this.authService.currentUser.displayName);
  //     }
  //   } else {
  //     let users = [];
  //     users.push(this.authService.currentUser.displayName);
  //     this.emojiReactions.push({'emoji': emoji, 'counter': 1, 'users': users});
  //   }

  //   const docRef = doc(this.channelService.firestore, 'channels', this.channelService.channelId, 'chatText', messageId);
  //   await updateDoc(docRef, {
  //     emojiReactions: this.emojiReactions
  //   })
  //   this.emojiReactions = [];
  // }

  async addEmojiReaction(event: any, messageId: string) {
    await this.updateEmojiReactions(event, messageId);
    await this.saveEmojiReactions(messageId);
  }
  
  async updateEmojiReactions(event: any, messageId: string) {
    this.emojiReactions = await this.getEmojiReactions(messageId);

    const emoji = event.emoji.native;
    let emojiInReactions = this.emojiReactions.find(element => emoji === element['emoji']);

    if (emojiInReactions) {
      this.updateExistingReaction(emojiInReactions, emoji);
    } else {
      this.addNewReaction(emoji);
    }
  }

  addNewReaction(emoji: string) {
    let users = [this.authService.currentUser.displayName];
    this.emojiReactions.push({ 'emoji': emoji, 'counter': 1, 'users': users });
  }

  updateExistingReaction(emojiInReactions: any, emoji: string) {
    let index = this.emojiReactions.map(element => element.emoji).indexOf(emoji);
    if (!emojiInReactions['users'].includes(this.authService.currentUser.displayName)) {
      this.emojiReactions[index]['counter']++;
      this.emojiReactions[index].users.push(this.authService.currentUser.displayName);
    }
  }

  async saveEmojiReactions(messageId: string) {
    const docRef = doc(this.channelService.firestore, 'channels', this.channelService.channelId, 'chatText', messageId);
    await updateDoc(docRef, {
      emojiReactions: this.emojiReactions
    });
    this.emojiReactions = [];
    this.showEmojiPickerReaction.set(messageId, false);
  }

  async getEmojiReactions(messageId: string) {
    const docRef = doc(this.channelService.firestore, 'channels', this.channelService.channelId, 'chatText', messageId);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      if (docSnapshot.data()['emojiReactions'] === undefined) {
        return [];
      } else {
        return docSnapshot.data()['emojiReactions'];
      }
    }
  }

  async countEmojis(message: Message, emoji: any) {
    this.emojiReactions = await this.getEmojiReactions(message.docId!);
    let element: any;

    for (let index = 0; index < message.emojiReactions.length; index++) {
      element = message.emojiReactions[index];
      if (element === emoji) {
        this.emojiCounter++;
      }
    }

    this.emojiReactions.filter((emoji: any) => {
      if (element === emoji) {
        this.emojiReactions.splice(1, element);
      }
    })
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showEmojiPicker && !this.emojiPickerElement?.nativeElement.contains(event.target)) {
      this.showEmojiPicker = false;
    } else if (this.showEmojiPickerReaction !== undefined && !this.emojiPickerReactionElement?.nativeElement.contains(event.target)) {
      for (let index = 0; index < this.channelService.messages.length; index++) {
        const message = this.channelService.messages[index];
        this.showEmojiPickerReaction.set(message.docId!, false);
      }
    }
  }

  onClickInside(event: MouseEvent) {
    event.stopPropagation();
  }

  hideErrorMessage() {
    this.messageEmpty = false;
  }

  toggleMessageBoxSize(messageBoxContainer: HTMLDivElement) {
    if (this.channelService.isThreadHidden) {
      messageBoxContainer.style.width = '30%';
    } else {
      messageBoxContainer.style.width = '55%';
    }
  }
}
