import { Component, inject } from '@angular/core';
import { SingleMessageComponent } from './single-message/single-message.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import { AddMemberDialogComponent } from '../channel-list/add-member-dialog/add-member-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [SingleMessageComponent, MatButtonModule, MatIconModule, AddMemberDialogComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  readonly dialog = inject(MatDialog);

  openDialog() {
    this.dialog.open(AddMemberDialogComponent);
  }
}
