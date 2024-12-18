import { Component, Inject, inject } from '@angular/core';
import {
  MatDialogModule,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../services/channel.service';
import { User } from '../../../users/user.interface';
import { UserService } from '../../../services/users.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import {
  Firestore,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'app-add-new-people-dialog',
  standalone: true,
  templateUrl: './add-new-people-dialog.component.html',
  styleUrl: './add-new-people-dialog.component.scss',
  imports: [
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatAutocompleteModule,
  ],
})
export class AddNewPeopleDialogComponent {
  userService = inject(UserService);
  channelService = inject(ChannelService);
  searchService = inject(SearchService);
  checkedAll = '';
  checkedSelect = '';
  channelName: string = '';
  userId?: string;
  channelId: string = '';
  users: User[] = [];
  username: string = '';
  searchResultsUsers: string[] = [];
  searchAll: string = '';
  userFound: boolean = false;
  // searchAllUsers = '';
  // userFound: boolean = false;

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    this.channelName = this.data.name;
    await this.getUserId();
    this.searchService.searchAll = '';
  }

  async getUserId() {
    const q = query(this.userService.getUserRef());

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(doc.data()['uid']);
      this.users.push(doc.data()['uid']);
    });
  }

  async getChannelId() {
    const q = query(
      collection(this.firestore, 'channels'),
      where('name', '==', this.channelName)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(doc.data()['channelId']);
      this.channelId = doc.id;
    });
  }

  async addAllMembersToChannel() {
    if (this.checkedAll) {
      await this.getChannelId();
      await updateDoc(this.channelService.getSingleChannelRef(this.channelId), {
        member: this.users,
      });
    }
    this.dialog.closeAll();
  }

  async selectMembers() {
    await this.userInDatabase();
    if(this.username && this.userFound) {
      console.log('User found');
      //show user in input
      await this.getSingleUserId();
      await this.addUserToChannel();
      this.dialog.closeAll();
    }
    
  }

    async getSingleUserId() {
      const q = query(
        collection(this.firestore, 'users'),
        where('username', '==', this.username)
      );
  
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        console.log(doc.data()['uid']);
        this.userId = doc.id;
      });
    }



    async addUserToChannel() {
      await this.getChannelId();
      await updateDoc(doc(this.firestore, 'channels', this.channelId), {
        member: arrayUnion(this.userId),
      });
    }

  async userInDatabase() {
    for (let index = 0; index < this.userService.users.length; index++) {
      const element = this.userService.users[index].username;
      if (this.username === element) {
        this.userFound = true;
  
        break;
      } else {
        this.userFound = false;
        continue;
      }
    }
  }



}
