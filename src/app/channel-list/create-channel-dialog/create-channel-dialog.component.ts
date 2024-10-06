import { Component, Output, EventEmitter, inject } from '@angular/core';
import {
  MatDialogModule,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../interfaces/channel.interface';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-create-channel-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
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
  constructor(
    private channelService: ChannelService,
    private dialog: MatDialog
  ) {}

  name = '';
  description = '';

  addChannel() {
    let currentUser = this.authService.currentUser;
    let channel: Channel = {
      id: '',
      docId: '',
      name: this.name,
      description: this.description,
      owner: currentUser?.uid ?? '',
      member: [currentUser?.uid ?? '']
  }; 
    this.channelService.saveChannel(
      channel.name,
      channel.description,
      channel.owner,
      channel.member
    );

    this.dialog.closeAll();
  }
}
