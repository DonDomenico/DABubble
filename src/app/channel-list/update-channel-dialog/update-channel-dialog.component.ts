import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogModule,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../interfaces/channel.interface';

@Component({
  selector: 'app-update-channel-dialog',
  standalone: true,
  imports: [ MatIconModule, MatDialogActions, MatDialogClose,  MatDialogModule,
    MatDialogContent, MatDialogTitle],
  templateUrl: './update-channel-dialog.component.html',
  styleUrl: './update-channel-dialog.component.scss'
})
export class UpdateChannelDialogComponent {

  isChannelNameHidden = false;
  isChannelDescriptionHidden = false;

  channelName: string = '';
  channelDescription: string = '';

  constructor(private channelService: ChannelService, private dialog: MatDialog) {}

  getChannelList(): Channel[] {
    return this.channelService.channels;
  }

  updateChannelName() {
    this.isChannelNameHidden = !this.isChannelNameHidden;
  }
  changeChannelName() {
    //change->upadate channelName
    console.log('Channel-Name gespeichert');
    this.isChannelNameHidden = false;

  }

  updateChannelDescription() {
    this.isChannelDescriptionHidden = !this.isChannelDescriptionHidden;
  }
  changeChannelDescription() {
    //change->upadate channelDescription
    console.log('Channel-Description gespeichert');
    this.isChannelDescriptionHidden = false;
  }
}
