import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ConversationsService } from '../../services/conversations.service';
import { UsersComponent } from '../../users/users.component';
import { UserService } from '../../services/users.service';
import {User} from '../../users/user.interface'
import { ShowProfileDialogComponent } from '../../users/show-profile-dialog/show-profile-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [MatIconModule, CommonModule, UsersComponent],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss'
})
export class SingleMessageComponent implements OnInit {
  @Output() toggleSingleMessage: EventEmitter<any> = new EventEmitter();
  constructor(private conversationService: ConversationsService, private userServices: UserService, private dialog: MatDialog, private route: ActivatedRoute) {}
  
  userId: string = "";

  ngOnInit() {
    this.route.params.subscribe( async params => {
      this.userId = params['id'];
      console.log('GOT ID', this.userId);
  })

  }

  showProfileDialog() {
    this.dialog.open(ShowProfileDialogComponent);
  }
}
