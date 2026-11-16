import { Component, computed, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/auth-service';

@Component({
  selector: 'app-navbar',
  imports: [MatButtonModule, MatMenuModule, MatToolbarModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuToggle = output<void>();

  protected readonly user = this.auth.user;
  protected readonly displayName = computed(
    () => this.user()?.name ?? this.user()?.email ?? 'Pengguna',
  );
  protected readonly role = computed(() => this.auth.user()?.role ?? null);
  protected readonly initial = computed(() => this.displayName().charAt(0).toUpperCase());

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
