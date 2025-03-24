import { Component, EventEmitter, Output, inject } from '@angular/core';
import { User } from './user.interface';
import { UserService } from '../services/users.service';
import { DialogModule } from '@angular/cdk/dialog';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { CommonModule } from '@angular/common';
import { ConversationsService } from '../services/conversations.service';
import { getDocs, onSnapshot, query, where } from '@angular/fire/firestore';
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
  dataLoaded: boolean = false;

  constructor(
    public userService: UserService,
    public conversationService: ConversationsService
  ) { }

  async ngOnInit() {
    setTimeout(() => {
      this.unsubConversations = this.subConversations();
    }, 500);
  }

  ngOnDestroy() {
    this.unsubConversations();
  }

  subConversations() {
    return onSnapshot(query(this.conversationService.getConversationsRef(), where('members', 'array-contains', this.authService.currentUser.uid)), conversationList => {
      this.conversationService.conversations = [];
      conversationList.forEach(doc => {
        this.conversationService.conversations.push(this.conversationService.toJsonConversations(doc.data(), doc.id));
      })
      console.log('Conversations: ', this.conversationService.conversations);
      this.filterUsers();
    })
  }

  // async getUsers() {
  //   this.userService.users = [];
  //   const q = query(this.userService.getUserRef());

  //   const querySnapshot = await getDocs(q);
  //   querySnapshot.forEach((doc) => {
  //     this.userService.users.push(this.userService.toJson(doc.data(), doc.id));
  //   });
  //   await this.filterUsers();
  //   this.dataLoaded = true;
  // }

  async filterUsers() {
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
