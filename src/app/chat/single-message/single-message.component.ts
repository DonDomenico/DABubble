import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ConversationsService } from '../../services/conversations.service';
import { UsersComponent } from '../../users/users.component';
import { UserService } from '../../services/users.service';
import { User } from '../../users/user.interface';
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
} from '@angular/fire/firestore';

@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [MatIconModule, CommonModule, UsersComponent],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss',
})
export class SingleMessageComponent implements OnInit {
  @Output() toggleSingleMessage: EventEmitter<any> = new EventEmitter();
  constructor(
    private conversationService: ConversationsService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private firestore: Firestore
  ) {}

  userId: string = '';
  user: User | undefined;
  ngOnInit(): void {
    this.route.children[0].params.subscribe(async (params) => {
      this.userId = params['id'] || '';
      this.getSingleUser();
      // console.log('GOT USER: ', this.userId);
    });
  }

  async getSingleUser() {
    if (this.userId) {
      const userRef = this.userService.getSingleUserRef(this.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        this.user = this.userService.toJson(userDoc.data(), userDoc.id);
      } else {
        console.log('No such document!');
      }
    } else {
      this.user = this.userService.users[2];
    }
  }

  showProfileDialog(userId: string) {
    this.dialog.open(ShowProfileDialogComponent, {
      data: { uid: userId },
    });
  }
}
