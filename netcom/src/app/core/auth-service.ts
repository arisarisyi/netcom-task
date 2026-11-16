import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Role, isRole } from './roles';

export interface UserInfo {
  name: string;
  email: string;
  role: Role | null;
}

const TOKEN_KEY = 'netcom_token';
const USER_KEY = 'netcom_user';

function decodeTokenRole(token: string): Role | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')));
    return isRole(payload?.role) ? payload.role : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _user = signal<UserInfo | null>(this.readStoredUser());
  readonly user = this._user.asReadonly();

  get token(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  register(name: string, email: string, password: string): Observable<UserInfo> {
    return this.http
      .post<{ data: UserInfo }>('/api/users', {
        name,
        email,
        password,
        role: 'customers',
      })
      .pipe(mapData());
  }

  login(email: string, password: string): Observable<UserInfo> {
    return new Observable<UserInfo>((subscriber) => {
      this.http.post<{ data: UserInfo & { token?: string } }>('/api/login', { email, password }).subscribe({
        next: (res) => {
          const user = res.data;
          if (user?.token) {
            this.saveSession(user.token, {
              name: user.name,
              email: user.email,
              role: decodeTokenRole(user.token),
            });
          }
          subscriber.next(user);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });
    });
  }

  logout(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
    }
    this._user.set(null);
  }

  private saveSession(token: string, user: UserInfo): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
    }
    this._user.set(user);
  }

  private readStoredUser(): UserInfo | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const user = JSON.parse(raw) as UserInfo;
      if (!user.role) {
        const token = localStorage.getItem(TOKEN_KEY);
        user.role = token ? decodeTokenRole(token) : null;
      }
      return user;
    } catch {
      return null;
    }
  }
}

function mapData<T>() {
  return (source: Observable<{ data: T }>): Observable<T> =>
    new Observable<T>((subscriber) =>
      source.subscribe({
        next: (res) => subscriber.next(res.data),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      }),
    );
}

export function extractErrorMessage(err: unknown): string {
  const httpErr = err as HttpErrorResponse;
  const body = httpErr?.error;

  if (body && Array.isArray(body.errors) && typeof body.errors[0] === 'object') {
    return body.errors.map((e: { path: string; message: string }) => `${e.path}: ${e.message}`).join(', ');
  }

  if (body && typeof body.errors === 'string') {
    return body.errors;
  }

  if (body && typeof body.message === 'string') {
    return body.message;
  }

  if (httpErr?.status === 0) {
    return 'Tidak dapat terhubung ke server. Pastikan backend berjalan.';
  }

  return 'Terjadi kesalahan. Coba lagi beberapa saat.';
}
