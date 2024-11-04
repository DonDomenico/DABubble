import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from './user.interface';
import { UserService } from '../services/users.service';
import { ShowProfileDialogComponent } from './show-profile-dialog/show-profile-dialog.component';
import { DialogModule } from '@angular/cdk/dialog';
import { MatDialog } from '@angular/material/dialog';
import { SingleMessageComponent } from '../chat/single-message/single-message.component';
import { GeneralViewComponent } from '../general-view/general-view.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ RouterModule,DialogModule, SingleMessageComponent, GeneralViewComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  userList: User[] = [];
  @Output() toggleSingleMessage: EventEmitter<any> = new EventEmitter();
  isSingleMessageHideen = false;

  constructor(private userService: UserService, private dialog: MatDialog, private router: Router) {
 
  }

  getList(): User[] {
    return this.userService.users;
  }

}
