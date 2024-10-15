import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  @Output() toggleThread: EventEmitter<any> = new EventEmitter();

  isThreadHidden = false;
  closeThread() {
   this.isThreadHidden = !this.isThreadHidden;
   this.toggleThread.emit(this.isThreadHidden);

  }
}
