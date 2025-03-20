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
  updateDoc,
} from '@angular/fire/firestore';
import { AuthenticationService } from '../../services/authentication.service';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, DatePipe, PickerModule, NgClass, MatTooltip],
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
  @Output() showSidenav = new EventEmitter<boolean>();
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
  emojiPickerOpen: boolean = false;
  showEmojiPickerReaction: Map<string, boolean> = new Map();
  emojiReactions: (any | any)[] = [];
  emojiCounter: number = 0;
  @ViewChild('emojiPickerReaction') private emojiPickerReactionElement: ElementRef | undefined;
  isEditing = false;
  editText = '';
  edited: boolean = false;
  editMessageId: string = ''; 
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
      this.showEmojiPickerReaction.clear();
      this.unsubConversationMessages = this.subConversationMessages(this.conversationId);
      this.setDivHeight(); // Setzt die Höhe beim Laden der Seite
    });
  }

  ngOnDestroy() {
    this.unsubConversationMessages();
    // this.unsubConversations();
    if (this.routeSubscription !== undefined) {
      this.routeSubscription.unsubscribe();
    }
  }

  setDivHeight() {
    const div = document.getElementById('messages-container');
    if (div && window.innerWidth < 1000) {
      div.style.height = `${window.innerHeight - 66 - 172 - 66}px`;
      this.isMobile = true;
    } else if(div) {
      div.style.height = `${window.innerHeight - 120 - 80 - 210}px`;
    }
  }

  async getConversationId() {
    if (this.authService.currentUser !== null) {
      // this.conversationMessages = [];
      const docRef = query(collection(this.firestore, 'conversations'), where('members', 'array-contains', this.authService.currentUser.uid));
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
      await this.conversationService.getConversationMessages(this.conversationId);
    }
    this.dataLoaded = true;
    this.cdRef.detectChanges();
    this.scrollToBottom();
  }

  async createConversation() {
    if (this.authService.currentUser) {
      await this.conversationService.addNewConversation(this.userId, this.authService.currentUser?.uid);
    }
  }

  async addMessageText() {
    await this.conversationService.checkConversationExists(this.authService.currentUser.uid, this.userId);
    if (!this.conversationService.conversationExists) {
      await this.createConversation();
    }

    if (this.conversationMessage !== "") {
      const newDirectMessage: DirectMessage = {
        initiatedBy: this.authService.currentUser?.displayName!,
        senderAvatar: this.authService.currentUser?.photoURL!,
        recipientId: this.userId,
        recipientAvatar: this.user?.photoURL!,
        senderMessage: this.conversationMessage,
        timestamp: new Date().getTime(),
        edited: false,
        read: false
      };

      this.conversationService.addNewConversationMessage(newDirectMessage);
      await this.getConversationId();
      // await this.getConversationMessages();
      this.conversationMessage = '';
      this.messageEmpty = false;
    } else if (this.isEditing) {
      const editedDirectMessage: DirectMessage = {
        initiatedBy: this.authService.currentUser?.displayName!,
        senderAvatar: this.authService.currentUser?.photoURL!,
        recipientId: this.userId,
        recipientAvatar: this.user?.photoURL!,
        senderMessage: this.editText,
        timestamp: new Date().getTime(),
        emojiReactions: [{ emoji: '', counter: 0, users: [] }],
        edited: true
      };
      this.addEditedConversationMessage(editedDirectMessage, this.editMessageId);
      this.conversationMessage = '';
      this.isEditing = false;
      this.editText = '';
      this.messageEmpty = false;
    } else {
      this.messageEmpty = true;
    }
  }

  editMessage(conversationMessages: DirectMessage, messageId: string) {
    this.isEditing = true;
    this.editText = conversationMessages.senderMessage;
    this.editMessageId = messageId;
  }

  async addEditedConversationMessage(editedDirectMessage: DirectMessage, messageId: string) {
    const docRef = doc(this.firestore, 'conversations', this.conversationId, 'messages', messageId);
    await updateDoc(docRef, {
      senderMessage: editedDirectMessage.senderMessage,
      edited: true
    });
  }

  subConversationMessages(conversationId: string) {
    if (conversationId !== "") {
      const conversationMessagesRef = this.conversationService.getConversationMessagesRef(conversationId);
      const q = query(conversationMessagesRef, orderBy("timestamp"));
      return onSnapshot(q, (querySnapshot: any) => {
        this.conversationMessages = [];
        querySnapshot.forEach((doc: any) => {
          this.conversationMessages.push(this.conversationService.toJsonDirectMessage(doc.data(), doc.id));
        });
        this.cdRef.detectChanges();
        this.scrollToBottom();
        console.log('Conversation Messages: ', this.conversationMessages);
      });
    } else {
      return undefined;
    }
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

  toggleEmojiPickerReaction(messageId: string) {
    this.emojiPickerOpen = true;
    const currentState = this.showEmojiPickerReaction.get(messageId) || false;
    this.showEmojiPickerReaction.set(messageId, !currentState);
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
    const docRef = doc(this.firestore, 'conversations', this.conversationId, 'messages', messageId);
    await updateDoc(docRef, {
      emojiReactions: this.emojiReactions
    });
    this.emojiReactions = [];
    this.showEmojiPickerReaction.set(messageId, false);
  }

  async getEmojiReactions(messageId: string) {
    const docRef = doc(this.firestore, 'conversations', this.conversationId, 'messages', messageId);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      if (docSnapshot.data()['emojiReactions'] === undefined) {
        return [];
      } else {
        return docSnapshot.data()['emojiReactions'];
      }
    } else {
      return [];
    }
  }

  async countEmojis(message: DirectMessage, emoji: any) {
    this.emojiReactions = await this.getEmojiReactions(this.conversationId);
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

  @HostListener('click', ['$event'])
  onComponentClick(event: MouseEvent) {
    if (this.showEmojiPicker && !this.emojiPickerElement?.nativeElement.contains(event.target)) {
      this.showEmojiPicker = false;
    } else if (this.showEmojiPickerReaction !== undefined && !this.emojiPickerReactionElement?.nativeElement.contains(event.target)) {
      for (let index = 0; index < this.conversationMessages.length; index++) {
        const message = this.conversationMessages[index];
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

  emitToggleSidenav() {
    this.showSidenav.emit(true);
  }
}