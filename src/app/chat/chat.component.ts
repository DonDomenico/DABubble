import { Component, inject } from '@angular/core';
import { SingleMessageComponent } from './single-message/single-message.component';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { AddMemberDialogComponent } from '../channel-list/add-member-dialog/add-member-dialog.component';
import { SingleChannelComponent } from "../channel-list/single-channel/single-channel.component";


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, SingleMessageComponent, MatButtonModule, MatIconModule, AddMemberDialogComponent, SingleChannelComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {

  timestamp: string | null = null;


  sendMessage() {
    const now = new Date();
    const today = new Date().setHours(0, 0, 0, 0);
    const messageDate = now.setHours(0, 0, 0, 0);

    if (messageDate === today) {
      this.timestamp = 'Heute';
    } else {
      this.timestamp = now.toLocaleDateString();
    }
  }
}
