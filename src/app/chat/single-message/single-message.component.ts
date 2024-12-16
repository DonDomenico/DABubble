import {
  Component,
  EventEmitter,
  ViewChild, ElementRef,
  Output,
  OnInit,
  inject,
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

@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, DatePipe],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss',
  providers: [
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: "dd.MM.yyyy" }
    }
  ],
})
export class SingleMessageComponent implements OnInit {
  authService = inject(AuthenticationService);
  @ViewChild('messageTextarea')
  messageTextarea!: ElementRef;
  @Output() toggleSingleMessage: EventEmitter<any> = new EventEmitter();
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

  constructor(
    public conversationService: ConversationsService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private firestore: Firestore
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
      // setTimeout(() => { this.messageTextarea.nativeElement.focus(); }, 0);   wirft Fehler
      // this.unsubConversations = this.subConversations();
      this.unsubConversationMessages = this.subConversationMessages();
    });
  }

  ngOnDestroy() {
    if(this.conversationMessages.length !== 0) {
      this.unsubConversationMessages();
    }
    // this.unsubConversations();
  }

  async getConversationId() {
    if (this.authService.currentUser !== null) {
      this.conversationMessages = [];
      const docRef = query(collection(this.firestore, 'conversations'));
      const querySnapshot = await getDocs(docRef);

      querySnapshot.forEach((doc) => {
        if (doc.data()['members'].includes(this.userId) && doc.data()['members'].includes(this.authService.currentUser?.uid)) {
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
  }

  async createConversation() {
    if (this.authService.currentUser) {
      await this.conversationService.checkConversationExists(this.authService.currentUser?.uid, this.userId);

      if (!this.conversationService.conversationExists) {
        await this.conversationService.addNewConversation(
          this.userId,
          this.authService.currentUser?.uid
        );
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

  subConversations() {
    const conversationRef = this.conversationService.getSingleConversationRef(this.conversationId);

    return onSnapshot(conversationRef, () => {});
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
      timestamp: obj.timestamp || '',
      // messageDate: obj.messageDate || '',
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

  showProfileDialog(userId: string) {
    this.dialog.open(ShowProfileDialogComponent, {
      data: { uid: userId },
    });
  }
}
