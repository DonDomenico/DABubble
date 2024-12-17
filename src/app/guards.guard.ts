import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';

export const guardsGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if(authService.hasAccess === true) {
    return true;
  } 
  return router.navigateByUrl('/unauthorized');
};
