import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { User } from '../../users/user.interface';



@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss'
})
export class SingleMessageComponent {

constructor(private conversationService: FirestoreService) {

}
  
}
