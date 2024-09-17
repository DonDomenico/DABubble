import { Component, Output, EventEmitter } from '@angular/core';
import {MatDialogModule,  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../services/channel.service';


@Component({
  selector: 'app-create-channel-dialog',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
  templateUrl: './create-channel-dialog.component.html',
  styleUrl: './create-channel-dialog.component.scss'
})
export class CreateChannelDialogComponent {
  @Output() newChannelEvent = new EventEmitter<string>();
  
  constructor(private channelService: ChannelService, private dialog: MatDialog) {}

  channelModel = { channelName: '', channelDescription: "" };


  addChannel(channelName: string) {
    console.log(this.channelModel.channelName);
    console.log(this.channelModel.channelDescription);
    this.channelService.changeChannelName(channelName);
    this.channelModel.channelName = "";
    this.channelModel.channelDescription = "";
    this.dialog.closeAll();
    
  }
  
}
