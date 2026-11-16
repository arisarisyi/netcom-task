import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth-service';

const PUBLIC_ENDPOINTS = ['/api/login', '/api/users'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((err: unknown) => {
      const isPublic = PUBLIC_ENDPOINTS.some((url) => req.url.includes(url));
      if (!isPublic && err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
        auth.logout();
        inject(Router).navigateByUrl('/login');
      }
      return throwError(() => err);
    }),
  );
};
