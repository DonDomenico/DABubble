import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { GeneralViewComponent } from './general-view/general-view.component';
import { ChooseProfileImageComponent } from './signup/choose-profile-image/choose-profile-image.component';
import { ResetPasswordMailComponent } from './login/reset-password-mail/reset-password-mail.component';
import { ChatComponent } from './chat/chat.component';
import { SingleMessageComponent } from './chat/single-message/single-message.component';
import { SingleChannelComponent } from './channel-list/single-channel/single-channel.component';
import { authGuard } from './auth.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ThreadComponent } from './thread/thread.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

export const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "signup/select-avatar", component: ChooseProfileImageComponent },
  { path: "send-mail", component: ResetPasswordMailComponent },
  {
    path: "general-view", component: GeneralViewComponent,
    // canMatch: [authGuard],
    // canActivate: [authGuard],
    // canMatch: [guardsGuard],
    children: [
      {
        path: "single-channel/:id", component: SingleChannelComponent,
        children: [
          { path: "thread/:id", component: ThreadComponent }
        ]
      },
      // { path: "single-channel/:id/thread", component: ThreadComponent },
      { path: "single-message/:id", component: SingleMessageComponent },
      { path: "channel-list", component: ChatComponent }
    ]
  },
  { path: "unauthorized", component: UnauthorizedComponent },
  { path: "imprint", component: ImprintComponent },
  { path: "privacy-policy", component: PrivacyPolicyComponent },
];