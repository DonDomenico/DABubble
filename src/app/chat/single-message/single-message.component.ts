import {
  Component,
  EventEmitter,
  ViewChild, ElementRef,
  Output,
  OnInit,
  inject,
  OnDestroy,
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectorRef,
  Renderer2
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversationsService } from '../../services/conversations.service';
import { UserService } from '../../services/users.service';
import { User } from '../../users/user.interface';
import { DirectMessage } from '../../interfaces/directMessage.interface';
import { ShowProfileDialogComponent } from '../../users/show-profile-dialog/show-profile-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  Firestore,
  onSnapshot,
  query,
  orderBy,
  where,
} from '@angular/fire/firestore';
import { AuthenticationService } from '../../services/authentication.service';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, DatePipe, PickerModule],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss',
  providers: [
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: "dd.MM.yyyy" }
    }
  ],
})
export class SingleMessageComponent implements OnInit, OnDestroy {
  authService = inject(AuthenticationService);
  // @ViewChild('messageTextarea') inputField!: ElementRef;
  @Output() toggleSingleMessage: EventEmitter<any> = new EventEmitter();
  @ViewChild('messagesContainer') private messagesContainer: ElementRef | undefined;
  userId: string = '';
  user: User | undefined;
  isCurrentUser: boolean = false;
  username: string | undefined = '';
  conversationMessages: DirectMessage[] = [];
  conversationMessage: string = '';
  conversationId: string = '';
  unsubConversationMessages: any;
  messageEmpty: boolean = false;
  isToday: boolean = false;
  dataLoaded: boolean = false;
  dateExists: boolean = false;
  showEmojiPicker = false;

  constructor(
    public conversationService: ConversationsService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.children[0].params.subscribe(async (params) => {
      this.conversationId = "";
      this.conversationService.conversationExists = false;
      this.conversationMessages = [];
      this.userId = params['id'] || '';
      this.user = await this.getSingleUser();
      await this.getConversationId();
      if (this.userId === this.authService.currentUser?.uid) {
        this.isCurrentUser = true;
      } else this.isCurrentUser = false;
      await this.getConversationMessages();
      // this.checkDate();
      // setTimeout(() => { this.messageTextarea.nativeElement.focus(); }, 0);   wirft Fehler
      this.unsubConversationMessages = this.subConversationMessages();
    });
  }

  // ngAfterViewInit(): void {
  //   if(this.dataLoaded) {
  //     this.scrollToBottom();
  //   }
  // }

  ngOnDestroy() {
    if(this.conversationMessages.length !== 0) {
      this.unsubConversationMessages();
    }
  }

  async getConversationId() {
    if (this.authService.currentUser !== null) {
      this.conversationMessages = [];
      const docRef = query(collection(this.firestore, 'conversations'));
      const querySnapshot = await getDocs(docRef);

      querySnapshot.forEach((doc) => {
        if (doc.data()['members'].includes(this.userId) && doc.data()['members'].includes(this.authService.currentUser?.uid) && this.userId !== this.authService.currentUser.uid) {
          this.conversationId = doc.id;
        } else if(this.userId === this.authService.currentUser.uid && doc.data()['members'][0] === this.authService.currentUser.uid && doc.data()['members'][1] === this.authService.currentUser.uid) {
          this.conversationId = doc.id;
        }
      })
    }
  }

  async getConversationMessages() {
    if (this.conversationId !== "") {
      const q = query(collection(this.firestore, `conversations/${this.conversationId}/messages`), orderBy("timestamp"));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        this.conversationMessages.push(this.toJsonDirectMessage(doc.data()));
      });
    }
    this.dataLoaded = true;
    this.cdRef.detectChanges();
    this.scrollToBottom();
  }

  async createConversation() {
    if (this.authService.currentUser) {
      await this.conversationService.checkConversationExists(this.authService.currentUser?.uid, this.userId);

      if (!this.conversationService.conversationExists) {
        await this.conversationService.addNewConversation(this.userId,this.authService.currentUser?.uid);
        this.addMessageText();
      } else {
        this.addMessageText();
      }
    }
  }

  addMessageText() {
    if(this.conversationMessage !== "") {
      const newDirectMessage: DirectMessage = {
        initiatedBy: this.authService.currentUser?.displayName!,
        senderAvatar: this.authService.currentUser?.photoURL!,
        recipientId: this.userId,
        recipientAvatar: this.user?.photoURL!,
        senderMessage: this.conversationMessage,
        timestamp: new Date().getTime(),
        // messageDate: new Date().getTime(),
      };
  
      this.conversationService.addNewConversationMessage(newDirectMessage);
      this.conversationMessage = '';
      this.messageEmpty = false;
    } else {
      this.messageEmpty = true;
    }
  }

  subConversationMessages() {
    if (this.conversationId !== "") {
      const conversationRef = this.conversationService.getSingleConversationRef(this.conversationId);
      const q = query(collection(conversationRef, 'messages'), orderBy("timestamp"));
      return onSnapshot(q, (list: any) => {
        this.conversationMessages = [];
        list.forEach((doc: any) => {
          this.conversationMessages.push(this.toJsonDirectMessage(doc.data()));
        });
      });
    } return undefined;
  }

  toJsonDirectMessage(obj: any): DirectMessage {
    return {
      initiatedBy: obj.initiatedBy || '',
      senderAvatar: obj.senderAvatar || '',
      recipientAvatar: obj.recipientAvatar || '',
      recipientId: obj.recipientId || '',
      senderMessage: obj.senderMessage || '',
      timestamp: obj.timestamp || ''
    };
  }

  async getSingleUser(): Promise<User | undefined> {
    if (this.userId) {
      const userRef = this.userService.getSingleUserRef(this.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        this.user = this.userService.toJson(userDoc.data(), userDoc.id);
        return this.user;
      } else {
        console.log('No such document!');
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  // checkDate() {
  //   for (let index = 0; index < this.conversationMessages.length; index++) {
  //     const message = this.conversationMessages[index];
  //     const messageDate = new Date(message.timestamp);
  //     const today = new Date();
  //     if(messageDate.toLocaleDateString('de-DE') === today.toLocaleDateString('de-DE')) {
  //       this.isToday = true;
  //     } else {
  //       this.isToday = false;
  //     }
  //   }
  // }

  isDifferentDay(index: number) {
    if (index === 0) {
      return true; // Datum der ersten Nachricht immer anzeigen
    }
    const currentMessageDate = new Date(this.conversationMessages[index].timestamp);
    const previousMessageDate = new Date(this.conversationMessages[index - 1].timestamp);
  
    // Vergleiche nur das Datum, nicht die Uhrzeit
    const isSameDay = currentMessageDate.toLocaleDateString() === previousMessageDate.toLocaleDateString();
    
    return !isSameDay; // Zeige Datum nur an, wenn der Tag anders ist
  }

  private scrollToBottom(): void {
    if (this.messagesContainer && this.messagesContainer.nativeElement) {
      this.renderer.setProperty(this.messagesContainer.nativeElement, 'scrollTop', this.messagesContainer.nativeElement.scrollHeight);
    }
  }

  showProfileDialog(userId: string) {
    this.dialog.open(ShowProfileDialogComponent, {
      data: { uid: userId },
    });
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    console.log(this.conversationMessage)
    const { conversationMessage } = this;
    console.log(conversationMessage);
    console.log(`${event.emoji.native}`)
    const text = `${conversationMessage}${event.emoji.native}`;

    this.conversationMessage = text;
    // this.showEmojiPicker = false;
  }

  onFocus() {
    console.log('focus');
    this.showEmojiPicker = false;
  }

  onBlur() {
    console.log('onblur')
  }
}
