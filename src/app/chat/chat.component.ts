import { Component, inject } from '@angular/core';
import { SingleMessageComponent } from './single-message/single-message.component';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import { AddMemberDialogComponent } from '../channel-list/add-member-dialog/add-member-dialog.component';
import { MatDialog } from '@angular/material/dialog';

interface Message {
  userName: string;
    userAvatar: string;
    userMessage: string;
    userTime: string;
    answer: string;
    lastAnswerTime: string;
    isRowReverse: boolean;
}
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, SingleMessageComponent, MatButtonModule, MatIconModule, AddMemberDialogComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  readonly dialog = inject(MatDialog);

  timestamp: string | null = null;

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

  addMemberDialog() {
    this.dialog.open(AddMemberDialogComponent);
  }
  sendMessage() {
    const now = new Date();
    const today = new Date().setHours(0, 0, 0, 0);
    const messageDate = now.setHours(0, 0, 0, 0);

    if (messageDate === today) {
      this.timestamp = 'Heute';
    } else {
      this.timestamp = now.toLocaleDateString();
    }

    // Hier kannst du die Nachricht weiterverarbeiten, z.B. an einen Server senden
    // console.log('Nachricht gesendet:', this.message);
  }
}
