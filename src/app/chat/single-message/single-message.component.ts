import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversationsService } from '../../services/conversations.service';
// import { UsersComponent } from '../../users/users.component';
import { UserService } from '../../services/users.service';
import { User } from '../../users/user.interface';
import { Conversation } from '../../interfaces/conversation';
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
} from '@angular/fire/firestore';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss',
})
export class SingleMessageComponent implements OnInit {
  authService = inject(AuthenticationService);
  @Output() toggleSingleMessage: EventEmitter<any> = new EventEmitter();
  constructor(
    public conversationService: ConversationsService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private firestore: Firestore
  ) {}

  userId: string = '';
  user: User | undefined;
  isCurrentUser: boolean = false;
  username: string | undefined = '';
  conversations: Conversation[] = [];
  conversationMessage: string = '';
  conversationId: string = '';
  unsubConversationMessages: any;

  ngOnInit(): void {
    this.route.children[0].params.subscribe(async (params) => {
      this.conversationService.conversations = [];
      this.userId = params['id'] || '';
      this.user = await this.getSingleUser();
      this.conversationId = params['id'] + this.authService.currentUser?.uid || '';
      if (this.userId === this.authService.currentUser?.uid) {
        this.isCurrentUser = true;
      } else this.isCurrentUser = false;
      await this.getConversationChat();
      this.unsubConversationMessages = this.subConversationMessages(this.conversationId);
    });
  }
  ngOnDestroy() {
    this.unsubConversationMessages;
  }

  async getConversationChat() {
    const q = query(
      collection(
        this.firestore,
        `conversations/${this.conversationId}/messages`
      )
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      this.conversationService.conversations.push(
        this.conversationService.toJsonConversation(doc.data(), doc.id)
      );
    });
    console.log('GOT Conversations', this.conversationService.conversations);
  }

  addMessageText() {
    const newConversation: Conversation = {
      id: this.conversationId,
      initiatedBy: this.authService.currentUser?.displayName!,
      senderAvatar: this.authService.currentUser?.photoURL!,
      recipientId: this.userId,
      recipientAvatar: this.user?.photoURL!,
      senderMessage: this.conversationMessage,
      timestamp: new Date().toLocaleTimeString(),
      messageDate: new Date().toLocaleDateString(),
    };
    this.conversationService.addNewConversation(newConversation);
    this.conversationMessage = '';
  }

  subConversationMessages(conversationId: string) {
    const conversationRef =
      this.conversationService.getSingleConversationRef(conversationId);
    const q = query(
      collection(conversationRef, 'messages'),
      orderBy('messageDate'),
      orderBy('timestamp')
    );
    return onSnapshot(q, (list: any) => {
      this.conversations = [];
      list.forEach((doc: any) => {
        this.conversations.push(this.toJsonConversation(doc.data(), doc.id));
      });
      console.log('SINGLE CHAT WORKS', this.conversations);
    });
  }

  toJsonConversation(obj: any, id?: string): Conversation {
    return {
      id: id || obj.id,
      initiatedBy: obj.initiatedBy || '',
      senderAvatar: obj.senderAvatar || '',
      recipientAvatar: obj.recipientAvatar || '',
      recipientId: obj.recipientId || '',
      senderMessage: obj.senderMessage || '',
      timestamp: obj.timestamp || '',
      messageDate: obj.messageDate || '',
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
