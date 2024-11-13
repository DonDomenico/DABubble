import { Component, inject } from '@angular/core';
import { SingleMessageComponent } from './single-message/single-message.component';
import { CommonModule } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [RouterModule, CommonModule, SingleMessageComponent, MatIconModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {

  
}
