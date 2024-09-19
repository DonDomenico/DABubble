import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss'
})
export class SingleMessageComponent {
  @Output() newItemEvent = new EventEmitter<string>();

@Input() index: number = 0;

@Input() message = {
  userName: "Noah Braun",
  userMessage: "Welche Version ist aktuell von Angular?"
}

}
