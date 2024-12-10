import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogModule,
  MatDialog,
  MatDialogClose,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../interfaces/channel.interface';
import { ActivatedRoute } from '@angular/router';
import { SingleChannelComponent } from '../single-channel/single-channel.component';
import { getDoc } from '@angular/fire/firestore';


@Component({
  selector: 'app-update-channel-dialog',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, MatDialogClose, SingleChannelComponent],
  templateUrl: './update-channel-dialog.component.html',
  styleUrl: './update-channel-dialog.component.scss',
})
export class UpdateChannelDialogComponent {
  isChannelNameHidden = false;
  isChannelDescriptionHidden = false;
  channelId: string = '';
  channel: Channel | undefined;
  channelName: string = '';
  channelDescription: string = '';

  constructor(
    public channelService: ChannelService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    this.channelId = this.data.channelId; 
    console.log('Channel ID:', this.channelId);
    this.channel = await this.getSingleChannel();
 
  }

  getChannelList(): Channel[] {
    return this.channelService.channels;
  }


  async getSingleChannel(): Promise<Channel | undefined> {
    if (this.channelId != undefined) {
     const channelRef = this.channelService.getSingleChannelRef(this.channelId);
      const channelSnapshot = await getDoc(channelRef);
      if (channelSnapshot.exists()) {
        return this.channelService.toJson(channelSnapshot.data(), channelSnapshot.id);
      } else {
        console.log('No such document!');
        return undefined;
      }
    } else {
      return this.channelService.channels[0];
    }
  }

  

  updateChannelName() {
    this.isChannelNameHidden = !this.isChannelNameHidden;
  }
  async changeChannelName() {
    const newChannelName = this.channelName;
    // this.isChannelNameHidden = false;
    //  await this.channelService.updateChannelName(this.channel.channelId, newChannelName);
    //change->upadate channelName
    console.log('Channel-Name gespeichert');
    this.isChannelNameHidden = false;
  }

  async updateChannelDescription() {
    const newChannelDescription = this.channelDescription;
    this.isChannelDescriptionHidden = !this.isChannelDescriptionHidden;
  }
  changeChannelDescription() {
    //change->upadate channelDescription
    console.log('Channel-Description gespeichert');
    this.isChannelDescriptionHidden = false;
  }
}
