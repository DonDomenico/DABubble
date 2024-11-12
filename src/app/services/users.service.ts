import { inject, Injectable, OnDestroy } from '@angular/core';
import { onSnapshot } from "firebase/firestore";
import { addDoc, collection, doc, Firestore, query, updateDoc, where } from '@angular/fire/firestore';
import { User } from '../users/user.interface';
import { Conversation } from '../interfaces/conversation';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {
  firestore = inject(Firestore);
  users: User [] = [];
  conversations: Conversation [] = [];
  unsubUserList;
  
  constructor() { 
    this.unsubUserList = this.subUserList();
  }

  ngOnDestroy() {
    this.unsubUserList();
  }

//   async updateUser(user: User) { 
//     if (user && user.uid) { 
//       let userRef = this.getSingleUser(this.getColIdFromUser(user), user.uid); 
//       try { 
//         await updateDoc(userRef, this.getCleanJson(user)); 
//         console.log('User updated successfully'); 
//       } catch (error) { 
//     console.error('Error updating user: ', error); 
//   }

//  }
//  }

  async updateUser(user: User) {
if (user && user.uid) {
  let userRef = this.getSingleUserRef(user.uid);
  await updateDoc(userRef, this.getCleanJson(user)).catch
  (error => console.log(error));
} 
  }




getCleanJson(user: User) {
  return {  
    uid: user.uid,
    username: user.username,
    email: user.email,
    photoURL: user.photoURL
  };
}

getColIdFromUser(user: User) {
  return user?.uid ?? '';
}

  getUserRef() {
    return collection(this.firestore, 'users');
  }

  getSingleUser(colId: string, docId: string) {
 
    return doc(collection(this.firestore, colId), docId);
  }

  getSingleUserRef(uid: string) {
    return doc(this.getUserRef(), uid);
   
  }

  subUserList() {
    return onSnapshot(this.getUserRef(), userList => {
      this.users = [];
      userList.forEach(user => {
        console.log(this.toJson(user.data(), user.id));
        this.users.push(this.toJson(user.data(), user.id));
      })
    })
  }

  toJson(obj: any, id?: string): User {
    return {
      uid: id || "",
      username: obj.username || "",
      email: obj.email || "",
      photoURL: obj.photoURL || "",
      active: obj.active
    }
  }
}
