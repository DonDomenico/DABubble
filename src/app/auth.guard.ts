import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';

export const authGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if(authService.currentUser !== null && authService.currentUser !== undefined) {
    return true;
  }
  return router.navigateByUrl('unauthorized');
};
