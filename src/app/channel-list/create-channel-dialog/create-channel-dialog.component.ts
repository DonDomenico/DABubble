import { Component, Output, EventEmitter, inject } from '@angular/core';
import {
  MatDialogModule,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogConfig,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../interfaces/channel.interface';
import { AuthenticationService } from '../../services/authentication.service';
import { AddNewPeopleDialogComponent } from './add-new-people-dialog/add-new-people-dialog.component';
import { collection, Firestore, getDocs, query } from '@angular/fire/firestore';

@Component({
  selector: 'app-create-channel-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
  ],
  templateUrl: './create-channel-dialog.component.html',
  styleUrl: './create-channel-dialog.component.scss',
})
export class CreateChannelDialogComponent {
  @Output() newChannelEvent = new EventEmitter<string>();
  authService = inject(AuthenticationService);
  firestore = inject(Firestore);

  constructor(
    private channelService: ChannelService,
    private dialog: MatDialog
  ) { }

  name = '';
  description = '';
  channelNameFound = false;
  alertMessage: boolean = false;

  async addChannel() {
    await this.doesChannelNameExist();
    let currentUser = this.authService.currentUser;
    let channel: Channel = {
      id: '',
      docId: '',
      name: this.name,
      description: this.description,
      // owner: currentUser?.uid ?? '',
      owner: currentUser?.displayName ?? '',
      member: [currentUser?.uid ?? ''],
    };
    if (!this.channelNameFound) {
      this.channelService.saveChannel(
        channel.name,
        channel.description,
        channel.owner,
        channel.member
      );
      this.addNewPeopleDialog();
    } else {
      this.alertMessage = true;
    }
  }

  async doesChannelNameExist() {
    let channels: Channel[] = [];
    const q = query(collection(this.firestore, 'channels'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      channels.push(this.channelService.toJsonChannel(doc.data(), doc.id));
    });
    for (let index = 0; index < channels.length; index++) {
      const element = channels[index].name;
      if (this.name === element) {
        this.channelNameFound = true;
        this.alertMessage = true;
        break;
      } else {
        this.channelNameFound = false;
        continue;
      }
    }
  }

  clearAlertMessage() {
    this.alertMessage = false;
    this.name = '';
  }

  addNewPeopleDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      name: this.name,

    };
    this.dialog.open(AddNewPeopleDialogComponent, dialogConfig);

  }
}
