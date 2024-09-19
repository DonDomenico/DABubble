import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';


import { fromEvent, timestamp } from 'rxjs';


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
  userAvatar: "./assets/img/avatar4.svg",
  userMessage: "Welche Version ist aktuell von Angular?",
  userTime: "12:00 Uhr",
  answer: "2 Antworten",
  lastAnswerTime: "Letzte Antwort 14:56"
}

// const clickWithTimestamp = fromEvent(document, 'click').pipe(
//   timestamp()
// );

// Emits data of type { value: PointerEvent, timestamp: number }
// clickWithTimestamp.subscribe((data: { value: PointerEvent, timestamp: number }) => {
//   console.log(data);
// });

}
