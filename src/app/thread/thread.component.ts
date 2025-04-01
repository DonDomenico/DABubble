import { Component, Output, EventEmitter, ViewChild, Input, OnInit, HostListener, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChannelService } from '../services/channel.service';
import { Channel } from '../interfaces/channel.interface';
import { MatDialogModule } from '@angular/material/dialog';
import { Firestore, getDoc, doc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Message } from '../interfaces/message.interface';
import { DATE_PIPE_DEFAULT_OPTIONS, DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { MatTooltip } from '@angular/material/tooltip';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MatDialogModule, MatIcon, DatePipe, FormsModule, MatTooltip, PickerModule, CommonModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
  providers: [
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: "dd.MM.yyyy" }
    }]
})
export class ThreadComponent implements OnInit {
  @Input() channelId!: string;
  @Output() toggleThread: EventEmitter<any> = new EventEmitter();
  messageId: string = '';
  messageEmpty: boolean = false;
  channel: Channel | undefined;
  channelName: string = '';
  answer = '';
  unsubChannelChat: any;
  message: any;
  dataLoaded: boolean = false;
  threadAnswers: any = [];
  activeRoute = '';
  routeSubscription: any;
  routerSubscription: any;
  showEmojiPicker: boolean = false;
  showEmojiPickerReaction: Map<number, boolean> = new Map();
  emojiReactions: (any | any)[] = [];
  emojiCounter: number = 0;
  isEditing = false;
  editText = '';
  currentUser: any;
  edited: boolean = false;
  answerIndex: number = 0;
  emojiPickerOpen: boolean = false;
  unsubThread: any;
  @ViewChild('emojiPicker') private emojiPickerElement: ElementRef | undefined;
  @ViewChild('emojiPickerReaction') private emojiPickerReactionElement: ElementRef | undefined;
  @ViewChild('answersContainer') private answersContainer: ElementRef | undefined;

  constructor(
    public channelService: ChannelService,
    public authService: AuthenticationService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
    this.activeRoute = this.router.url;
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit() {
    this.routeSubscription = this.route.children[0].children[0].params.subscribe(async params => {
      this.messageId = params['id'];
      this.channelName = this.channelService.channels.find((item) => {
        return item.docId == this.channelId;
      })?.name || '';
      this.message = await this.getThreadMessage();
      this.unsubThread = this.subThread();
      this.dataLoaded = true;
      if (this.emojiPickerOpen === false) {
        this.cdRef.detectChanges();
        this.scrollToBottom();
      }
      this.setDivHeight();
    });

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.channelService.isThreadHidden = true;
      }
    });
  }

  ngOnDestroy() {
    this.unsubThread();
    if (this.routeSubscription !== undefined) {
      this.routeSubscription.unsubscribe();
    }
    if (this.routerSubscription !== undefined) {
      this.routerSubscription.unsubscribe();
    }
  }

  setDivHeight() {
    const messagesContainer = document.getElementById('thread-messages-container');
    const section = document.getElementById('thread-section');
    const inputWrapper = document.getElementById('message-box-wrapper');

    if (messagesContainer && inputWrapper && section && window.innerWidth < 1000) {
      let inputWrapperHeight = inputWrapper.offsetHeight;
      section.style.height = `${window.innerHeight - 66}px`;
      messagesContainer.style.height = `${window.innerHeight - 66 - 60 - inputWrapperHeight}px`;
    } else if (section && inputWrapper && messagesContainer) {
      let inputWrapperHeight = inputWrapper.offsetHeight;
      section.style.height = `${window.innerHeight - 120}px`;
      messagesContainer.style.height = `${window.innerHeight - 120 - 96 - inputWrapperHeight}px`;
    }
  }

  subThread() {
    return onSnapshot(doc(this.firestore, 'channels', this.channelId, 'chatText', this.messageId), (doc: any) => {
      this.message = doc.data();
      this.threadAnswers = this.message.answers;
      if (this.emojiPickerOpen === false) {
        this.cdRef.detectChanges();
        this.scrollToBottom();
      }
    });
  }

  async getSingleChannel(): Promise<Channel | undefined> {
    if (this.channelId != undefined) {
      const channelRef = this.channelService.getSingleChannelRef(this.channelId);
      const channelSnapshot = await getDoc(channelRef);
      if (channelSnapshot.exists()) {
        return this.channelService.toJsonChannel(channelSnapshot.data(), channelSnapshot.id);
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  async getThreadMessage() {
    const messageRef = doc(this.firestore, "channels", this.channelId, "chatText", this.messageId);
    const messageSnapshot = await getDoc(messageRef);
    if (messageSnapshot.exists()) {
      return this.channelService.toJsonMessage(messageSnapshot.data(), messageSnapshot.id);
    } else {
      return undefined;
    }
  }

  addAnswer() {
    if (this.isEditing) {
      const editedAnswer: Message = {
        userName: this.authService.currentUser?.displayName!,
        userAvatar: this.authService.currentUser?.photoURL!,
        userMessage: this.editText,
        timestamp: new Date().getTime(),
        edited: true
      }
      this.threadAnswers.splice(this.answerIndex, 1, editedAnswer);
    } else if (this.answer !== '') {
      const newAnswer: Message = {
        userName: this.authService.currentUser?.displayName!,
        userAvatar: this.authService.currentUser?.photoURL!,
        userMessage: this.answer,
        timestamp: new Date().getTime(),
        edited: false
      };
      this.threadAnswers.push(newAnswer);
      this.message = '';
      this.messageEmpty = false;
    } else {
      this.messageEmpty = true;
    }
    this.saveAnswerInFirestore();
  }

  saveAnswerInFirestore() {
    updateDoc(doc(this.firestore, `channels/${this.channelId}/chatText/${this.messageId}`),
      {
        answers: this.threadAnswers,
        edited: true
      }
    )
    this.answer = '';
    this.editText = '';
    this.isEditing = false;
  }

  findIndexOfAnswer(answer: Message) {
    return this.threadAnswers.indexOf(answer);
  }

  async closeThread() {
    this.channelService.isThreadHidden = !this.channelService.isThreadHidden;
    this.channelService.hideSingleChannel = false;
    this.router.navigateByUrl(`/general-view/single-channel/${this.channelId}`);
    this.toggleThread.emit(this.channelService.isThreadHidden);
  }

  onClickInside(event: MouseEvent) {
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onComponentClick(event: MouseEvent) {
    if (this.showEmojiPicker && !this.emojiPickerElement?.nativeElement.contains(event.target)) {
      this.showEmojiPicker = false;
    } else if (this.showEmojiPickerReaction !== undefined && !this.emojiPickerReactionElement?.nativeElement.contains(event.target)) {
      for (let index = 0; index < this.channelService.messages.length; index++) {
        this.showEmojiPickerReaction.set(index!, false);
      }
    }
  }

  async addEmojiReaction(event: any, messageId: string, index: number) {
    await this.updateEmojiReactions(event, messageId, index);
    await this.saveEmojiReactions(messageId, index);
    setTimeout(() => {
      this.emojiPickerOpen = false;
    }, 500);
  }

  async updateEmojiReactions(event: any, messageId: string, index: number) {
    this.emojiReactions = await this.getEmojiReactions(messageId, index);

    const emoji = event.emoji.native;
    let emojiInReactions = this.emojiReactions.find(element => emoji === element['emoji']);

    if (emojiInReactions) {
      this.updateExistingReaction(emojiInReactions, emoji, index);
    } else {
      this.addNewReaction(emoji, index);
    }
  }

  addNewReaction(emoji: string, index: number) {
    let users = [this.authService.currentUser.displayName];
    this.emojiReactions.push({ 'emoji': emoji, 'counter': 1, 'users': users });
    this.message.answers[index]['emojiReactions'] = this.emojiReactions;
  }

  updateExistingReaction(emojiInReactions: any, emoji: string, answerIndex: number) {
    let index = this.emojiReactions.map(element => element.emoji).indexOf(emoji);
    if (!emojiInReactions['users'].includes(this.authService.currentUser.displayName)) {
      this.emojiReactions[index]['counter']++;
      this.message.answers[answerIndex].emojiReactions[index].users.push(this.authService.currentUser.displayName);
    }
  }

  async saveEmojiReactions(messageId: string, index: number) {
    const docRef = doc(this.channelService.firestore, 'channels', this.channelService.channelId, 'chatText', messageId);
    await updateDoc(docRef, {
      answers: this.message.answers
    });
    this.emojiReactions = [];
    this.showEmojiPickerReaction.set(index, false);
  }

  async getEmojiReactions(messageId: string, index: number) {
    const docRef = doc(this.channelService.firestore, 'channels', this.channelService.channelId, 'chatText', messageId);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      if (docSnapshot.data()['answers'][index]['emojiReactions'] === undefined) {
        return [];
      } else {
        return docSnapshot.data()['answers'][index]['emojiReactions'];
      }
    }
  }

  async countEmojis(message: Message, emoji: any, index: number) {
    this.emojiReactions = await this.getEmojiReactions(message.docId!, index);
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

  private scrollToBottom(): void {
    if (this.answersContainer && this.answersContainer.nativeElement) {
      this.renderer.setProperty(this.answersContainer.nativeElement, 'scrollTop', this.answersContainer.nativeElement.scrollHeight);
    }
  }

  onFocus() {
    this.showEmojiPicker = false;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  toggleEmojiPickerReaction(index: number) {
    this.emojiPickerOpen = true;
    const currentState = this.showEmojiPickerReaction.get(index) || false;
    this.showEmojiPickerReaction.set(index, !currentState);
  }

  addEmoji(event: any) {
    const { answer } = this;
    const text = `${answer}${event.emoji.native}`;
    this.answer = text;
    this.showEmojiPicker = false;
  }

  editMessage(answer: any) {
    this.isEditing = true;
    this.answerIndex = this.findIndexOfAnswer(answer);
    this.editText = answer.userMessage;
  }
}