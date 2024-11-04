import { Component, Inject, Input, Output } from '@angular/core';
import {MatDialogModule,  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
  MatDialogRef,
  MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { UserService } from '../../services/users.service';
import { addDoc, doc, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { arrayUnion, collection, documentId } from '@firebase/firestore';

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, FormsModule, MatFormField, FormsModule, ReactiveFormsModule],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.scss'
})
export class AddMemberDialogComponent {
  user?: string;
  userId?: string;
  userFound: boolean = false;
  userNotFound: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private userService: UserService, private firestore: Firestore) {}

  async addMember() {
    console.log(this.user);
    console.log(this.data.channelId);
    await this.userInDatabase();
    if(this.user && this.userFound) {
      console.log('User found');
      await this.getUserId();
      await this.addUserToChannel();
      // show success message
    } else {
      console.log('User not found');
      // show failure message
    }
  }

  async userInDatabase() {
    for (let index = 0; index < this.userService.users.length; index++) {
      const element = this.userService.users[index].username;
      if(this.user === element) {
        this.userFound = true;
        this.userNotFound = false;
        break;
      } else {
        this.userNotFound = true;
        continue;
      }
    }
  }

  async getUserId() {
    const q = query(collection(this.firestore, "users"), where("username", "==", this.user));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(doc.data()['uid']);
      this.userId = doc.data()['uid'];
    });
  }

  async addUserToChannel() {
    await updateDoc(doc(this.firestore, "channels", this.data.channelId), {
      member: arrayUnion(this.userId)
    });
  }
}
