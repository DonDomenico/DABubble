import { Component, Inject, Input, Output } from '@angular/core';
import {MatDialogModule,  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { UserService } from '../../services/users.service';
import { addDoc, doc, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { arrayUnion, collection, documentId, getDoc } from '@firebase/firestore';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../interfaces/channel.interface';
@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, MatDialogTitle, MatDialogActions, MatDialogClose, MatButtonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.scss'
})
export class AddMemberDialogComponent {
  user?: string;
  userId?: string;
  userFound: boolean = false;
  userNotFound: boolean = false;

  channelId: string = '';
  channel: Channel | undefined;
  channelName: string = '';


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private userService: UserService, private firestore: Firestore, public channelService: ChannelService, private dialog: MatDialog) {}

  async ngOnInit() {
    this.channelId = this.data.channelId;
    this.channel = await this.getSingleChannel();
  }


  async addMember() {
    console.log(this.user);
    console.log(this.data.channelId);
    await this.userInDatabase();
    if(this.user && this.userFound) {
      console.log('User found');
      await this.getUserId();
      await this.addUserToChannel();
      // show success message
      this.dialog.closeAll();
    } else {
      console.log('User not found');
      // show failure message
    }
    
  }

  async userInDatabase() {
    for (let index = 0; index < this.userService.users.length; index++) {
      const element = this.userService.users[index].username;
      if(this.user === element) {
        this.userFound = true;
        this.userNotFound = false;
        break;
      } else {
        this.userNotFound = true;
        continue;
      }
    }
  }

  async getUserId() {
    const q = query(collection(this.firestore, "users"), where("username", "==", this.user));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(doc.data()['uid']);
      this.userId = doc.data()['uid'];
    });
  }

  async addUserToChannel() {
    await updateDoc(doc(this.firestore, "channels", this.data.channelId), {
      member: arrayUnion(this.userId)
    });
  }

  async getSingleChannel(): Promise<Channel | undefined> {
    if (this.channelId != undefined) {
      const channelRef = this.channelService.getSingleChannelRef(
        this.channelId
      );
      const channelSnapshot = await getDoc(channelRef);
      if (channelSnapshot.exists()) {
        return this.channelService.toJson(
          channelSnapshot.data(),
          channelSnapshot.id
        );
      } else {
        console.log('No such document!');
        return undefined;
      }
    } else {
      return this.channelService.channels[0];
    }
  }
}
