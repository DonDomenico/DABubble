import { Component, inject, signal } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatInputModule, MatIconModule, MatMenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  authService = inject(AuthenticationService);

  ngOnInit() {
    this.authService.showCurrentUser();
  }
}
