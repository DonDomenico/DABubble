import { inject, Injectable, OnDestroy } from '@angular/core';
import { deleteDoc, getDoc, onSnapshot } from "firebase/firestore";
import { addDoc, collection, doc, Firestore, query, updateDoc, where } from '@angular/fire/firestore';
import { User } from '../users/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {
  firestore = inject(Firestore);
  users: User[] = [];
  unsubUserList: any;

  constructor() {
    this.unsubUserList = this.subUserList();
  }

  ngOnDestroy() {
    this.unsubUserList();
  }

  async updateUsername(user: any, newName: string) {
    if (user && user.uid) {
      let userRef = this.getSingleUserRef(user.uid);
      await updateDoc(userRef, this.getCleanJson(user, newName, user.email, user.photoURL)).catch
        (error => console.log(error));
    }
  }
  
  async updateUserEmail(user: any, newEmail: string) {
    if(user && user.uid) {
      let userRef = this.getSingleUserRef(user.uid);
      await updateDoc(userRef, this.getCleanJson(user, user.displayName, newEmail, user.photoURL)).catch(error => {
        console.log(error);
      })
    }
  }

  async updateUserAvatar(user: any, url: string) {
    if(user) {
      let userRef = this.getSingleUserRef(user.uid);
      await updateDoc(userRef, this.getCleanJson(user, user.displayName, user.email, url))
    }
  }

  getCleanJson(user: any, username: string, email: string, photoURL: string) {
    return {
      uid: user.uid,
      username: username,
      email: email,
      photoURL: photoURL
    };
  }

  getUserRef() {
    return collection(this.firestore, 'users');
  }

  getSingleUserRef(uid: string) {
    return doc(this.getUserRef(), uid);
  }

  async getSingleUser(uid: string): Promise<User | null> {
    const userRef = this.getSingleUserRef(uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return this.toJson(userDoc.data() as User, userDoc.id);
    } else {
      console.log('No such document!');
      return null;
    }
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

  async setStatusActive(user: any) {
    await updateDoc(this.getSingleUserRef(user.uid), {
      active: true
    })
  }

  async setStatusInactive(user: any) {
    await updateDoc(this.getSingleUserRef(user.uid), {
      active: false
    })
  }

  async deleteUserFromFirestore(user: User) {
    deleteDoc(this.getSingleUserRef(user.uid!)).then(() => {
      console.log('Account deleted from firestore');
    }).catch(error => {
      console.log(error.code);
    })
  }
}
