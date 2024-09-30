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

@Component({
  selector: 'app-update-channel-dialog',
  standalone: true,
  imports: [ MatIconModule, MatDialogActions, MatDialogClose,  MatDialogModule,
    MatDialogContent, MatDialogTitle],
  templateUrl: './update-channel-dialog.component.html',
  styleUrl: './update-channel-dialog.component.scss'
})
export class UpdateChannelDialogComponent {

}
