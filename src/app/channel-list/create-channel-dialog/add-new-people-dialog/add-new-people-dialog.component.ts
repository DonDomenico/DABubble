import { Component, Inject, inject, ViewChild } from '@angular/core';
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
  MatChipEditedEvent,
  MatChipGrid,
  MatChipInputEvent,
  MatChipsModule,
} from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  Firestore,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
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
    MatChipsModule,
    MatFormFieldModule,
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
  searchAll: string = '';
  userFound: boolean = false;
  selectedUsers: any[] = [];
  // @ViewChild('chipGrid') chipInput: MatChipGrid | undefined;

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
    // if(this.username && this.userFound) {
    if (this.selectedUsers && this.userFound) {
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
      // where('username', '==', this.username)
      where('username', '==', this.selectedUsers[0].username)
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
      // member: arrayUnion(this.userId),
      member: this.selectedUsers.map((user) => user.uid),
    });
  }

  async userInDatabase() {
    for (let index = 0; index < this.userService.users.length; index++) {
      const element = this.userService.users[index].username;
      if (this.selectedUsers[0].username === element) {
        this.userFound = true;

        break;
      } else {
        this.userFound = false;
        continue;
      }
    }
  }

  async removeChannel() {
    await this.getChannelId();
    await deleteDoc(doc(this.firestore, 'channels', this.channelId));
    this.dialog.closeAll();
  }

  addNewMember(newMember: any) {
    if (newMember) {
      this.selectedUsers.push(newMember);
      console.log('channel members', this.selectedUsers);
      this.username = '';
      // this.clean(this.username);
    }
  }
  // funktioniert nicht
  // clean(username: string): void {
  //   if (this.chipInput) {
  //     this.chipInput.value = [];
  //   }
  // }
}
