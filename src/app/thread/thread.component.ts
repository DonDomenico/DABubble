import { Component, Output, EventEmitter, ViewChild, Inject, Input, OnInit, OnChanges, HostListener, ElementRef } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChannelService } from '../services/channel.service';
import { Channel } from '../interfaces/channel.interface';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Firestore, getDoc, doc, addDoc, collection, updateDoc } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Message } from '../interfaces/message.interface';
<<<<<<< HEAD
import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS, DatePipe } from '@angular/common';
=======
import { DATE_PIPE_DEFAULT_OPTIONS, DatePipe, CommonModule } from '@angular/common';
>>>>>>> 78a09b7843bd194b268d1ecd5acff212573a71f1
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { MatTooltip } from '@angular/material/tooltip';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-thread',
  standalone: true,
<<<<<<< HEAD
  imports: [MatDialogModule, MatIcon, DatePipe, FormsModule, CommonModule],
=======
  imports: [MatDialogModule, MatIcon, DatePipe, FormsModule, MatTooltip, PickerModule, CommonModule],
>>>>>>> 78a09b7843bd194b268d1ecd5acff212573a71f1
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
  channel: Channel | undefined;
  channelName: string = '';
  answer = '';
  unsubChannelChat: any;
  message: any;
  dataLoaded: boolean = false;
  threadAnswers: Message[] = [];
  activeRoute = '';
  routeSubscription: any;
  routerSubscription: any;
<<<<<<< HEAD
  isEditing: boolean = false;
  editText = '';
  editMessageId = '';
=======
  showEmojiPicker: boolean = false;
  showEmojiPickerReaction: Map<number, boolean> = new Map();
  emojiReactions: (any | any)[] = [];
  emojiCounter: number = 0;
  @ViewChild('emojiPicker') private emojiPickerElement: ElementRef | undefined;
  @ViewChild('emojiPickerReaction') private emojiPickerReactionElement: ElementRef | undefined;

>>>>>>> 78a09b7843bd194b268d1ecd5acff212573a71f1
  constructor(
    public channelService: ChannelService,
    private authService: AuthenticationService,
    // public dialog: MatDialog,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private router: Router
  ) {
    this.activeRoute = this.router.url;
  }

  ngOnInit() {
    this.routeSubscription = this.route.children[0].children[0].params.subscribe(async params => {
      this.messageId = params['id'];
      this.channelName = this.channelService.channels.find((item) => {
        return item.docId == this.channelId;
      })?.name || '';
      this.message = await this.getThreadMessage();
      this.dataLoaded = true;
      await this.channelService.getThreadChatRef(this.channelId, this.messageId);
      this.threadAnswers = this.message.answers;
    });

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Schließe oder setze den Zustand zurück, wenn die Route gewechselt wird.
        console.log('Route wird gewechselt'); // später löschen
        this.channelService.isThreadHidden = true;
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSubscription !== undefined) {
      this.routeSubscription.unsubscribe();
    }
    if (this.routerSubscription !== undefined) {
      this.routerSubscription.unsubscribe();
    }
  }

  async getSingleChannel(): Promise<Channel | undefined> {
    if (this.channelId != undefined) {
      const channelRef = this.channelService.getSingleChannelRef(this.channelId);
      const channelSnapshot = await getDoc(channelRef);
      if (channelSnapshot.exists()) {
        return this.channelService.toJsonChannel(channelSnapshot.data(), channelSnapshot.id);
      } else {
        console.log('No such document!');
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  // get message that was clicked
  async getThreadMessage() {
    const messageRef = doc(this.firestore, "channels", this.channelId, "chatText", this.messageId);
    const messageSnapshot = await getDoc(messageRef);
    if (messageSnapshot.exists()) {
      return this.channelService.toJsonMessage(messageSnapshot.data(), messageSnapshot.id);
    } else {
      console.log('No such document!');
      return undefined;
    }
  }

  addAnswer() {
    const newAnswer: Message = {
      userName: this.authService.currentUser?.displayName!,
      userAvatar: this.authService.currentUser?.photoURL!,
      userMessage: this.answer,
      timestamp: new Date().getTime(),
    };
    this.threadAnswers.push(newAnswer);
    this.saveAnswerInFirestore();
  }

  saveAnswerInFirestore() {
    updateDoc(doc(this.firestore, `channels/${this.channelId}/chatText/${this.messageId}`),
      { answers: this.threadAnswers }
    )
    this.answer = '';
  }

  async closeThread() {
    this.channelService.isThreadHidden = !this.channelService.isThreadHidden;
    this.router.navigateByUrl(`/general-view/single-channel/${this.channelId}`);
    // this.toggleThread.emit(this.channelService.isThreadHidden);
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
<<<<<<< HEAD
  editAnswer(answer:any) {
    this.isEditing = true;
    this.editText = answer.userMessage;
    this.editMessageId = answer.messageId; 
  }

// erhöht die Anzahl der Reaktionen um 20 in single-channel.comp! WARUM?
  async saveEditedAnswer() {
    updateDoc(doc(this.firestore, `channels/${this.channelId}/chatText/${this.messageId}`),
    {
      answers: this.editText
    }
  )
  this.isEditing = false;
  this.editText = '';
 
    await this.getEditedAnswerFromFirestore();
  }

  // funktioniert noch nicht

  async getEditedAnswerFromFirestore() {
   
    
  }




=======

  onClickInside(event: MouseEvent) {
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showEmojiPicker && !this.emojiPickerElement?.nativeElement.contains(event.target)) {
      this.showEmojiPicker = false;
    } else if (this.showEmojiPickerReaction !== undefined && !this.emojiPickerReactionElement?.nativeElement.contains(event.target)) {
      for (let index = 0; index < this.channelService.messages.length; index++) {
        // const message = this.channelService.messages[index];
        this.showEmojiPickerReaction.set(index!, false);
      }
    }
  }

  async addEmojiReaction(event: any, messageId: string, index: number) {
    await this.updateEmojiReactions(event, messageId, index);
    await this.saveEmojiReactions(messageId, index);
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
    this.message.answers[index].emojiReactions = this.message.answers[index].emojiReactions.concat([{'emoji': emoji, 'counter': 1, 'users': users}]);
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

  onFocus() {
    this.showEmojiPicker = false;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  toggleEmojiPickerReaction(index: number) {
    const currentState = this.showEmojiPickerReaction.get(index) || false;
    this.showEmojiPickerReaction.set(index, !currentState);
  }

  addEmoji(event: any) {
    const { message } = this;
    const text = `${message}${event.emoji.native}`;
    this.message = text;
    this.showEmojiPicker = false;
  }
>>>>>>> 78a09b7843bd194b268d1ecd5acff212573a71f1
}
