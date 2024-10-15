import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ConversationsService } from '../../services/conversations.service';



@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss'
})
export class SingleMessageComponent {

constructor(private conversationService: ConversationsService) {

}
  
}
