import { Component, Output, EventEmitter, ViewChild, Inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChannelService } from '../services/channel.service';
import { Channel } from '../interfaces/channel.interface';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MatDialogModule, MatIcon],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  @Output() toggleThread: EventEmitter<any> = new EventEmitter();
  channelId: string = '';
  channel: Channel | undefined;
  channelName: string = '';

  constructor(
    public channelService: ChannelService,
    public dialog: MatDialog,
    // @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  isThreadHidden = false;

  
  // async ngOnInit() {
  //   this.channelId = this.data.channelId;
  //   this.channel = await this.getSingleChannel();
  // }

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
  closeThread() {
   this.isThreadHidden = !this.isThreadHidden;
   this.toggleThread.emit(this.isThreadHidden);

  }
}
