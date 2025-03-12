import { Component, EventEmitter, Output, inject } from '@angular/core';
import { User } from './user.interface';
import { UserService } from '../services/users.service';
import { DialogModule } from '@angular/cdk/dialog';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { CommonModule } from '@angular/common';
import { ConversationsService } from '../services/conversations.service';
import { getDocs, onSnapshot, query } from '@angular/fire/firestore';
import { MobileServiceService } from '../services/mobile.service';
import { DirectMessage } from '../interfaces/directMessage.interface';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [DialogModule, RouterModule, CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  authService = inject(AuthenticationService);
  mobileService = inject(MobileServiceService);
  // userList: User[] = [];
  @Output() toggleSingleMessage: EventEmitter<any> = new EventEmitter();
  isSingleMessageHidden = false;
  filteredUsers: User[] = [];
  unsubConversations: any;

  constructor(
    public userService: UserService,
    public conversationService: ConversationsService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.unsubConversations = this.subConversations();
    }, 500);
  }

  ngOnDestroy() {
    this.unsubConversations();
  }

  subConversations() {
    return onSnapshot(this.conversationService.getConversationsRef(), conversationList => {
      this.conversationService.conversations = [];
      conversationList.forEach(doc => {
        this.conversationService.conversations.push(this.conversationService.toJsonConversations(doc.data(), doc.id));
      })
      console.log('Conversations: ', this.conversationService.conversations);
      this.filterUsers();
    })
  }

  filterUsers() {
    this.filteredUsers = [];
    for (let index = 0; index < this.conversationService.conversations.length; index++) {
      const conversation = this.conversationService.conversations[index];
      if (conversation['members'].includes(this.authService.currentUser.uid) && !(conversation['members'][0] === this.authService.currentUser.uid && conversation['members'][1] === this.authService.currentUser.uid)) {
        let userId: any = this.getConversationPartner(conversation['members']);
        let userIndex = this.userService.users.findIndex(element => element.uid === userId);
        this.filteredUsers.push(this.userService.users[userIndex]);
      }
    }
  }

  getConversationPartner(array: []) {
    for (let index = 0; index < array.length; index++) {
      const userId = array[index];
      if (userId !== this.authService.currentUser.uid) {
        return userId;
      }
    }
  }
}
