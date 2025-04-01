import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
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
  updateDoc
} from '@angular/fire/firestore';
import { AuthenticationService } from '../../services/authentication.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ShowMembersDialogComponent } from '../show-members-dialog/show-members-dialog.component';
import { User } from '../../users/user.interface';
import { UserService } from '../../services/users.service';
import { MobileServiceService } from '../../services/mobile.service';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SearchService } from '../../services/search.service';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';


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
    MatAutocompleteModule,
    RouterModule,
    MatMenuModule
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
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger | undefined;

  constructor(
    public authService: AuthenticationService,
    public channelService: ChannelService,
    public searchService: SearchService,
    private userService: UserService,
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
      this.channelService.channelId = params['id'];
      await this.channelService.getChannelMembers(this.channelService.channelId);
      await this.getChannelMemberInfos();
      await this.getChannelChats(this.channelService.channelId);
      this.unsubChannelChat = this.subChannelChat(this.channelService.channelId);
      this.showEmojiPickerReaction.clear();
      this.setDivHeight();
    });
  }

  ngOnDestroy() {
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
    });
  }

  subSingleChannel(channelId: string) {
    return onSnapshot(doc(this.channelService.firestore, 'channels', channelId), (channel) => {
      this.channelService.channelMembers = [];
      channel.data()!['member'].forEach((member: User) => {
        this.channelService.channelMembers.push(member);
      });
    });
  }


  trackByFn(index: number, item: any): any {
    return item.id || index; 
  }
  

  insertMention(username: string): void {
    if (this.message) {
      this.message += ` @${username}`;
    } else {
      this.message = `@${username}`;
    }
    const textarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
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

  editMessage(message: Message, messageId: string) {
    this.isEditing = true;
    this.editText = message.userMessage;
    this.editMessageId = messageId;
  }
}