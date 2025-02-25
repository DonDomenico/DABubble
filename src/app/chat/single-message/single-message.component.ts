import {
  Component,
  EventEmitter,
  ViewChild, ElementRef,
  Output,
  OnInit,
  inject,
  OnDestroy,
  ChangeDetectorRef,
  Renderer2,
  HostListener
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversationsService } from '../../services/conversations.service';
import { UserService } from '../../services/users.service';
import { User } from '../../users/user.interface';
import { DirectMessage } from '../../interfaces/directMessage.interface';
import { ShowProfileDialogComponent } from '../../users/show-profile-dialog/show-profile-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
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
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, DatePipe, PickerModule, NgClass],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss',
  providers: [
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: "dd.MM.yyyy" }
    }
  ]
})
export class SingleMessageComponent implements OnInit, OnDestroy {
  authService = inject(AuthenticationService);
  @Output() toggleSingleMessage: EventEmitter<any> = new EventEmitter();
  @ViewChild('messagesContainer') private messagesContainer: ElementRef | undefined;
  @ViewChild('emojiPicker') private emojiPickerElement: ElementRef | undefined;
  @ViewChild('drawerSidenav') drawerSidenav: MatDrawer | undefined;

  userId: string = '';
  user: User | undefined;
  isCurrentUser: boolean = false;
  username: string | undefined = '';
  conversationMessages: DirectMessage[] = [];
  conversationMessage: string = '';
  conversationId: string = '';
  unsubConversations: any;
  unsubConversationMessages: any;
  messageEmpty: boolean = false;
  isToday: boolean = false;
  dataLoaded: boolean = false;
  dateExists: boolean = false;
  showEmojiPicker: boolean = false;
  routeSubscription: any;
  isMobile: boolean = false;
  isFirstMessage: boolean = false;

  constructor(
    public conversationService: ConversationsService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.children[0].params.subscribe(async (params) => {
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
      // this.unsubConversationMessages = this.subConversationMessages(this.conversationId);
      // this.unsubConversations = this.conversationService.subConversations();
    });
  }

  ngOnDestroy() {
    // if (this.conversationMessages.length !== 0) {
    //   this.unsubConversationMessages();
    // }
    // this.unsubConversations();
    if (this.routeSubscription !== undefined) {
      this.routeSubscription.unsubscribe();
    }
  }

  async getConversationId() {
    if (this.authService.currentUser !== null) {
      // this.conversationMessages = [];
      const docRef = query(collection(this.firestore, 'conversations'));
      const querySnapshot = await getDocs(docRef);

      querySnapshot.forEach((doc) => {
        if (doc.data()['members'].includes(this.userId) && doc.data()['members'].includes(this.authService.currentUser?.uid) && this.userId !== this.authService.currentUser.uid) {
          this.conversationId = doc.id;
        } else if (this.userId === this.authService.currentUser.uid && doc.data()['members'][0] === this.authService.currentUser.uid && doc.data()['members'][1] === this.authService.currentUser.uid) {
          this.conversationId = doc.id;
        }
      })
    }
  }

  async getConversationMessages() {
    if (this.conversationId !== "") {
      const q = query(collection(this.firestore, `conversations/${this.conversationId}/messages`), orderBy("timestamp"));
      const querySnapshot = await getDocs(q);
      this.conversationMessages = [];
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
      // await this.conversationService.checkConversationExists(this.authService.currentUser?.uid, this.userId);
      await this.conversationService.addNewConversation(this.userId, this.authService.currentUser?.uid);
      // this.addMessageText();
    }
  }

  // Funktion createConversation() innerhalb von addMessageText aufrufen, falls noch keine Konversation besteht
  async addMessageText() {
    await this.conversationService.checkConversationExists(this.authService.currentUser.uid, this.userId);
    if (!this.conversationService.conversationExists) {
      await this.createConversation();
      this.isFirstMessage = true;
    }

    if (this.conversationMessage !== "") {
      const newDirectMessage: DirectMessage = {
        initiatedBy: this.authService.currentUser?.displayName!,
        senderAvatar: this.authService.currentUser?.photoURL!,
        recipientId: this.userId,
        recipientAvatar: this.user?.photoURL!,
        senderMessage: this.conversationMessage,
        timestamp: new Date().getTime(),
      };
      this.conversationService.addNewConversationMessage(newDirectMessage);
     
      await this.getConversationId();
      await this.getConversationMessages();
        
      this.conversationMessage = '';
      this.messageEmpty = false;
    } else {
      this.messageEmpty = true;
    }
  }

  async subConversationMessages(conversationId: string) {
    if(conversationId !== "") {
      const conversationMessagesRef = this.conversationService.getConversationMessagesRef(conversationId);
      const q = query(conversationMessagesRef, orderBy("timestamp"));
      return onSnapshot(q, (querySnapshot: any) => {
        this.conversationMessages = [];
        querySnapshot.forEach((doc: any) => {
          this.conversationMessages.push(this.toJsonDirectMessage(doc.data()));
        });
        this.cdRef.detectChanges();
        this.scrollToBottom();
        console.log('Conversation Messages: ', this.conversationMessages);
      });
    } else {
      return undefined;
    }
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
    const { conversationMessage } = this;
    const text = `${conversationMessage}${event.emoji.native}`;
    this.conversationMessage = text;
    this.showEmojiPicker = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showEmojiPicker && !this.emojiPickerElement?.nativeElement.contains(event.target)) {
      this.showEmojiPicker = false;
    }
  }

  onClickInside(event: MouseEvent) {
    event.stopPropagation();
  }

  hideErrorMessage() {
    this.messageEmpty = false;
  }

}
