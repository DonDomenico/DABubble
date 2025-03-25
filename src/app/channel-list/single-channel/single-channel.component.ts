import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, inject, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
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
import { UpdateChannelDialogComponent } from '../update-channel-dialog/update-channel-dialog.component';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../interfaces/channel.interface';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  collection,
  where
} from '@angular/fire/firestore';
import { AuthenticationService } from '../../services/authentication.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ShowMembersDialogComponent } from '../show-members-dialog/show-members-dialog.component';
import { User } from '../../users/user.interface';
import { UserService } from '../../services/users.service';
import { MobileServiceService } from '../../services/mobile.service';


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
    mobileService = inject(MobileServiceService);
  [x: string]: any;
  conversationList: DirectMessage[] = [];
  message = '';
  messageEmpty: boolean = false;
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
  emojiPickerOpen: boolean = false;
  isEditing = false;
  editText = '';
  edited: boolean = false;
  editMessageId = '';
  currentUser: any;
  fullViews: boolean = true;
  isMobile: boolean = false;
  @ViewChild('messagesContainer') private messagesContainer: ElementRef | undefined;
  @ViewChild('emojiPicker') private emojiPickerElement: ElementRef | undefined;
  @ViewChild('emojiPickerReaction') private emojiPickerReactionElement: ElementRef | undefined;

  constructor(
    public authService: AuthenticationService,
    public channelService: ChannelService,
    private userService: UserService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    // window.addEventListener('resize', this.setDivHeight); // Passt die Höhe bei einer Größenänderung an
    this.routeSubscription = this.route.children[0].params.subscribe(async (params) => {
      this.channelService.channelMembers = [];
      this.channelService.memberInfos = [];
      this.channelService.messages = [];
      console.log(params); //Testcode, später löschen
      this.channelService.channelId = params['id'];
      console.log(this.channelService.channelId); //Testcode, später löschen
      await this.channelService.getChannelMembers(this.channelService.channelId);
      await this.getChannelMemberInfos();
      await this.getChannelChats(this.channelService.channelId);
      // this.unsubSingleChannel = this.channelService.subSingleChannel(this.channelService.channelId);
      // this.unsubMemberInfos = this.subMemberInfos();
      this.unsubChannelChat = this.subChannelChat(this.channelService.channelId);
      this.showEmojiPickerReaction.clear();
      this.setDivHeight(); // Setzt die Höhe beim Laden der Seite
    });
  }

  ngOnDestroy() {
    // this.unsubSingleChannel();
    // this.unsubMemberInfos();
    this.unsubChannelChat();
    if (this.routeSubscription !== undefined) {
      this.routeSubscription.unsubscribe();
    }
  }

  setDivHeight() {
    // const div = document.getElementById('messages-container');
    // if (div && window.innerWidth < 1000) {
    //   div.style.height = `${window.innerHeight - 66 - 60}px`;
    // } else if(div) {
    //   div.style.height = `${window.innerHeight - 120 - 96 - 170}px`;
    // }

    const messagesContainer = document.getElementById('messages-container');
    const section = document.getElementById('section');
    if (messagesContainer && section && window.innerWidth < 1000) {
      // messagesContainer.style.height = `${window.innerHeight - 66}px`;
      section.style.height = `${window.innerHeight - 66}px`;
      messagesContainer.style.height = `${window.innerHeight - 66 - 60 - 145}px`;
      this.isMobile = true;
    } else if(section && messagesContainer) {
      section.style.height = `${window.innerHeight - 120}px`;
      messagesContainer.style.height = `${window.innerHeight - 120 - 96 - 170}px`;
    }
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
      return undefined;
    }
  }

  async getChannelMemberInfos() {
    for (let index = 0; index < this.userService.users.length; index++) {
      const user = this.userService.users[index];
      
      if(user.uid && this.channelService.channelMembers.includes(user.uid)) {
        this.channelService.memberInfos.push(user);
      }
    }
  }

  async getChannelChats(channelId: string) {
    this.channelService.messages = [];
    const q = query(this.channelService.getChannelChatRef(channelId), orderBy('userTimestamp'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      this.channelService.messages.push(this.channelService.toJsonMessage(doc.data(), doc.id));
    });
    console.log('Channel message: ', this.channelService.messages); //Testcode, später löschen
    this.dataLoaded = true;
    if (this.emojiPickerOpen === false || this.channelService.isThreadHidden === true) {
      this.cdRef.detectChanges();
      this.scrollToBottom();
    }
  }

  subChannelChat(channelId: string) {
    const channelChatRef = this.channelService.getChannelChatRef(channelId);
    const q = query(channelChatRef, orderBy('userTimestamp'));
    return onSnapshot(q, (list: any) => {
      this.channelService.messages = [];
      list.forEach((doc: any) => {
        this.channelService.messages.push(this.channelService.toJsonMessage(doc.data(), doc.id));
      });
      if (this.emojiPickerOpen === false && this.channelService.isThreadHidden === true) {
        this.cdRef.detectChanges();
        this.scrollToBottom();
      }
      console.log('CHAT TEXT', this.channelService.messages);
    });
  }

  subSingleChannel(channelId: string) {
    return onSnapshot(doc(this.channelService.firestore, 'channels', channelId), (channel) => {
      console.log(channel.data());
      this.channelService.channelMembers = [];
      channel.data()!['member'].forEach((member: User) => {
        this.channelService.channelMembers.push(member);
      });
      console.log(this.channelService.channelMembers);
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
        edited: false
      };
      this.channelService.addText(newMessage);
      this.message = '';
      this.messageEmpty = false;
    } else if (this.isEditing) {
      const editedMessage: Message = {
        channelId: this.channelService.channelId,
        userName: this.authService.currentUser?.displayName!,
        userAvatar: this.authService.currentUser?.photoURL!,
        userMessage: this.editText,
        timestamp: new Date().getTime(),
        edited: true
      }
      this.saveEidtedMessageInFirestore(editedMessage, this.editMessageId);
      this.message = '';
      this.editText = '';
      this.isEditing = false;
    } else {
      this.messageEmpty = true;
    }
  }

  async saveEidtedMessageInFirestore(editedMessage: Message, editMessageId: string) {
    const docRef = doc(this.channelService.firestore, 'channels', this.channelService.channelId, 'chatText', editMessageId);
    await updateDoc(docRef, {
      userMessage: editedMessage.userMessage,
      edited: true
    });
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
    this.emojiPickerOpen = true;
    const currentState = this.showEmojiPickerReaction.get(messageId) || false;
    this.showEmojiPickerReaction.set(messageId, !currentState);
  }

  addEmoji(event: any) {
    const { message } = this;
    const text = `${message}${event.emoji.native}`;
    this.message = text;
    this.showEmojiPicker = false;
  }

  async addEmojiReaction(event: any, messageId: string) {
    await this.updateEmojiReactions(event, messageId);
    await this.saveEmojiReactions(messageId);
    setTimeout(() => {
      this.emojiPickerOpen = false;
    }, 500);
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

    for (let index = 0; index < message.emojiReactions!.length; index++) {
      element = message.emojiReactions![index];
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

  // isDifferentDay(index: number) {
  //   if (index === 0) {
  //     return true; // Datum der ersten Nachricht immer anzeigen
  //   }
  //   const currentMessageDate = new Date(this.channelService.messages[index].timestamp);
  //   const previousMessageDate = new Date(this.channelService.messages[index - 1].timestamp);

  //   // Vergleiche nur das Datum, nicht die Uhrzeit
  //   const isSameDay = currentMessageDate.toLocaleDateString() === previousMessageDate.toLocaleDateString();

  //   return !isSameDay; // Zeige Datum nur an, wenn der Tag anders ist
  // }

  private scrollToBottom(): void {
    if (this.messagesContainer && this.messagesContainer.nativeElement) {
      this.renderer.setProperty(this.messagesContainer.nativeElement, 'scrollTop', this.messagesContainer.nativeElement.scrollHeight);
    }
  }

  @HostListener('click', ['$event'])
  onComponentClick(event: MouseEvent) {
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

  checkMobile() {
    if (window.innerWidth < 1000) {
      this.isMobile = true;
    }
  }

  // toggleMessageBoxSize(messageBoxContainer: HTMLDivElement) {
  //   this.checkMobile();
  //   if (this.channelService.isThreadHidden && !this.isMobile) {
  //     messageBoxContainer.style.width = '30%';
  //   } else if (this.channelService.isThreadHidden && this.isMobile) {
  //     messageBoxContainer.style.width = '100%';
  //   } else {
  //     messageBoxContainer.style.width = '55%';
  //   }
  // }

  editMessage(message: Message, messageId: string) {
    this.isEditing = true;
    this.editText = message.userMessage;
    this.editMessageId = messageId;
  }
}
