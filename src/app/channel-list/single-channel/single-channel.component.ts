import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { Message } from '../../interfaces/message.interface';

@Component({
  selector: 'app-single-channel',
  standalone: true,
  imports: [MatIconModule, CommonModule, AddMemberDialogComponent],
  templateUrl: './single-channel.component.html',
  styleUrl: './single-channel.component.scss'
})
export class SingleChannelComponent implements OnInit {

  messages: Message[] = [
    {
      userName: "Noah Braun",
      userAvatar: "./assets/img/avatar4.svg",
      userMessage: "Welche Version ist aktuell von Angular?",
      userTime: "12:00 Uhr",
      answer: "2 Antworten",
      lastAnswerTime: "Letzte Antwort 14:56",
      isRowReverse: false
    },
    {
      userName: "Frederik Beck",
      userAvatar: "./assets/img/avatar3.svg",
      userMessage: "Die aktuellste stabile Version von Angular ist Angular 16, die im Mai 2023 veröffentlicht wurde. Diese Version bringt viele neue Features und Verbesserungen mit sich, darunter optimierte Leistung, verbesserte Entwicklerwerkzeuge und neue APIs.",
      userTime: "15:06 Uhr",
      answer: "",
      lastAnswerTime: "",
      isRowReverse: true
    },
  ]

  timestamp!: string;
  readonly dialog = inject(MatDialog);

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
  addMemberDialog() {
    this.dialog.open(AddMemberDialogComponent);
  }
}
