import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogClose, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../../services/channel.service';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component'; // {AddMemberDialogComponent}
import { ShowProfileDialogComponent } from '../../users/show-profile-dialog/show-profile-dialog.component';
import { UserService } from '../../services/users.service';
import { User } from '../../users/user.interface';


@Component({
  selector: 'app-show-members-dialog',
  standalone: true,
  imports: [MatIconModule, MatDialogModule],
  templateUrl: './show-members-dialog.component.html',
  styleUrl: './show-members-dialog.component.scss'
})
export class ShowMembersDialogComponent {
    channelService = inject(ChannelService);
    userService = inject(UserService);
    channelId: string = '';
    constructor(private dialog: MatDialog) {}

  
    async showProfileDialog(member: User) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        uid: member.uid,
      };
    
      this.dialog.open(ShowProfileDialogComponent, dialogConfig);
    }


    addMemberDialog() {
    const dialogConfig = new MatDialogConfig();
       dialogConfig.data = {
         channelId: this.channelService.channelId,
       };
   
       this.dialog.open(AddMemberDialogComponent, dialogConfig);
  }


}
