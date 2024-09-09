import { Component, inject } from '@angular/core';
import { CreateChannelDialogComponent } from './create-channel-dialog/create-channel-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [CreateChannelDialogComponent, MatIconModule],
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss'
})
export class ChannelListComponent {
  readonly dialog = inject(MatDialog);
  addChannelDialog() {
    this.dialog.open(CreateChannelDialogComponent);
  }
}
