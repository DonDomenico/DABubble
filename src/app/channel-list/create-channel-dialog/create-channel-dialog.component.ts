import { Component, Output, EventEmitter } from '@angular/core';
import {MatDialogModule,  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Channel } from '../channel';

@Component({
  selector: 'app-create-channel-dialog',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
  templateUrl: './create-channel-dialog.component.html',
  styleUrl: './create-channel-dialog.component.scss'
})
export class CreateChannelDialogComponent {
  @Output() newChannelEvent = new EventEmitter<string>();
  
  constructor(private dialog: MatDialog) {}


  channelModel: Channel = new Channel('', '');

  addChannel(channelName: string) {
    console.log(this.channelModel.channelName);
    console.log(this.channelModel.channelDescription);
    this.newChannelEvent.emit(channelName);
    this.channelModel.channelName = "";
    this.channelModel.channelDescription = "";
    this.dialog.closeAll();
    
  }
  
}
