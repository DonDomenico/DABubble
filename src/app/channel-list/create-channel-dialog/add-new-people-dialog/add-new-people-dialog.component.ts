import { Component, ElementRef, Inject, inject, ViewChild } from '@angular/core';
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
import {MatRadioModule} from '@angular/material/radio';
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
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { AuthenticationService } from '../../../services/authentication.service';
@Component({
  selector: 'app-add-new-people-dialog',
  standalone: true,
  templateUrl: './add-new-people-dialog.component.html',
  styleUrl: './add-new-people-dialog.component.scss',
  imports: [
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatDialogModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatRadioModule,
  ],
})
export class AddNewPeopleDialogComponent {
  userService = inject(UserService);
  channelService = inject(ChannelService);
  searchService = inject(SearchService);
  authenticationService = inject(AuthenticationService);
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
  readonly announcer = inject(LiveAnnouncer);
  currentUser = this.authenticationService.currentUser;
  @ViewChild('chipInput') chipInput: ElementRef | undefined;
 


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

  remove(member: string): void {
    const index = this.selectedUsers.indexOf(member);
    if (index < 0) {
      return;
    }
  
    this.selectedUsers.splice(index, 1);
// upadate arrey selectedUsers
this.selectedUsers = [...this.selectedUsers];
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
    this.addCurrenUserToArray();
    await this.userInDatabase();
    if (this.selectedUsers && this.userFound) {
      console.log('User found');
      await this.getSingleUserId();
      await this.addUserToChannel();
      this.dialog.closeAll();
    }
  }

  async getSingleUserId() {
    const q = query(
      collection(this.firestore, 'users'),
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
      member: this.selectedUsers.map((user) => user.uid),
    });
  }

   addCurrenUserToArray() {
    this.selectedUsers.push(
      {
        uid: this.currentUser.uid,
      }
    )
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
    }
    // clear input
    this.username = '';
    if (this.chipInput) { 
      this.chipInput.nativeElement.value = ''; }
   
  }

}
