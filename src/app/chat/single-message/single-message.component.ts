import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { formatDate } from '@angular/common';
import { CommonModule } from '@angular/common';
import { fromEvent, timestamp } from 'rxjs';


@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss'
})
export class SingleMessageComponent implements OnInit {


  @Input() message = 
  {
    userName: "Noah Braun",
    userAvatar: "./assets/img/avatar4.svg",
    userMessage: "Welche Version ist aktuell von Angular?",
    answer: "2 Antworten",
    lastAnswerTime: "Letzte Antwort 14:56",
    isRowReverse: false
  };

  timestamp!: string;

  messageDate: string = new Date().toLocaleTimeString();

  ngOnInit(): void {
    this.updateTimestamp();
    setInterval(() => this.updateTimestamp(), 60000); // Aktualisiert jede Minute
  }

  updateTimestamp(): void {
    const now = new Date();
    const today = new Date().setHours(0, 0, 0, 0);
    const messageDate = now.setHours(0, 0, 0, 0);

    if (messageDate === today) {
      this.timestamp = 'Heute';
    } else {
      this.timestamp = now.toLocaleDateString();
    }
  }

}
