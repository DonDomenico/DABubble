import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { GeneralViewComponent } from './general-view/general-view.component';
import { ChooseProfileImageComponent } from './signup/choose-profile-image/choose-profile-image.component';

export const routes: Routes = [
    { path: "", component: LoginComponent },
    { path: "signup", component: SignupComponent},
    { path: "signup/select-avatar", component: ChooseProfileImageComponent},
    { path: "general-view", component: GeneralViewComponent}
];
