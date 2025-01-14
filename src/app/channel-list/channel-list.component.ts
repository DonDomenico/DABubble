import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SearchService } from '../services/search.service';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss',
  imports: [MatIconModule, MatInputModule, MatAutocompleteModule, RouterLink, FormsModule]
})
export class ChannelListComponent {
  constructor(public searchService: SearchService) {}
  isUserSearch: boolean = false;
  
ngOnInit() {
  this.searchService.searchAll = '';
}

onKeyUp(event: KeyboardEvent): void { 
  const input = (event.target as HTMLInputElement).value; 
  if (input.startsWith('@')) { 
    this.isUserSearch = true;
   } else if (input.startsWith('#')) { 
    this.isUserSearch = false;
   } 
   this.searchService.searchUsersAndChannels();
 } 
}
