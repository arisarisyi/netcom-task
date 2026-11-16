import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService, extractErrorMessage } from '../../core/auth-service';
import { homeRoute } from '../../core/roles';

@Component({
  selector: 'app-login',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly mode = signal<'login' | 'register'>('login');
  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly showPassword = signal(false);

  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected readonly registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected showLogin(): void {
    this.mode.set('login');
    this.error.set('');
    this.success.set('');
  }

  protected showRegister(): void {
    this.mode.set('register');
    this.error.set('');
    this.success.set('');
  }

  protected handleLogin(event?: Event): void {
    event?.preventDefault();
    if (this.loginForm.invalid || this.submitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    const { email, password } = this.loginForm.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        void this.router.navigateByUrl(homeRoute(this.auth.user()?.role ?? null));
      },
      error: (err) => {
        this.error.set(extractErrorMessage(err));
        this.submitting.set(false);
      },
    });
  }

  protected handleRegister(event?: Event): void {
    event?.preventDefault();
    if (this.registerForm.invalid || this.submitting()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    const { name, email, password } = this.registerForm.getRawValue();
    this.auth.register(name, email, password).subscribe({
      next: () => {
        this.mode.set('login');
        this.success.set('Registrasi berhasil. Silakan login dengan akun Anda.');
        this.loginForm.patchValue({ email });
        this.registerForm.reset();
        this.submitting.set(false);
      },
      error: (err) => {
        this.error.set(extractErrorMessage(err));
        this.submitting.set(false);
      },
    });
  }
}
