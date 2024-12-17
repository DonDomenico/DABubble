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
import { Channel } from '../../../interfaces/channel.interface';
import { User } from '../../../users/user.interface';
import { UserService } from '../../../services/users.service';
import { AuthenticationService } from '../../../services/authentication.service';
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
  ],
})
export class AddNewPeopleDialogComponent {
  // authService = inject(AuthenticationService);
  userService = inject(UserService);
  channelService = inject(ChannelService);
  checkedAll = '';
  checkedSelect = '';
  channelName: string = '';
  // channel: Channel | undefined;
  userId?: string;
  channelId: string = '';
  users: User[] = [];

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    this.channelName = this.data.name;
    await this.getUserId();
   
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
    const q = query(collection(this.firestore, 'channels'), where('name', '==', this.channelName));

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
  
  }

  selectMembers() {}
}
