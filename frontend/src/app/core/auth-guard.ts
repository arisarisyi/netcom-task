import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';
import { Role, homeRoute } from './roles';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  if (auth.isLoggedIn) {
    return true;
  }
  return inject(Router).createUrlTree(['/login']);
};

export const roleGuard = (...roles: Role[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn) {
      return router.createUrlTree(['/login']);
    }
    const role = auth.user()?.role ?? null;
    if (!role || !roles.includes(role)) {
      return router.createUrlTree([homeRoute(role)]);
    }
    return true;
  };
};
