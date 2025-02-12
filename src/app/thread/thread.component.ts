import { Component, Output, EventEmitter, ViewChild, Inject, Input, OnInit, OnChanges } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChannelService } from '../services/channel.service';
import { Channel } from '../interfaces/channel.interface';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Firestore, getDoc, doc, addDoc, collection, updateDoc } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Message } from '../interfaces/message.interface';
import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { Thread } from '../interfaces/thread.interface';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MatDialogModule, MatIcon, DatePipe, FormsModule, CommonModule],
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
  threadAnswers: Thread[] = [];
  activeRoute = '';
  routeSubscription: any;
  routerSubscription: any;
  isEditing: boolean = false;
  editText = '';
  editMessageId = '';
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
    this.routeSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
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
    const newAnswer: Thread = {
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
      {
        answers: this.threadAnswers
      }
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




}
