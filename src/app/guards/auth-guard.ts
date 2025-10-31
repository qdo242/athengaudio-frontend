import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {

  const authSerivce = inject(AuthService);
  const router = inject(Router);

  if(authSerivce.currentUserValue){
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
