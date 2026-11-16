import { Component, inject, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Sidebar } from '../components/sidebar/sidebar';
import { Navbar } from '../components/navbar/navbar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, MatSidenavModule, Sidebar, Navbar],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly breakpoints = inject(BreakpointObserver);

  protected readonly handset = toSignal(this.breakpoints.observe(['(max-width: 959px)']), {
    initialValue: { matches: true, breakpoints: {} },
  });

  protected readonly drawerOpen = signal(false);

  protected toggleDrawer(): void {
    this.drawerOpen.update((open) => !open);
  }

  protected closeDrawer(): void {
    if (this.handset().matches) {
      this.drawerOpen.set(false);
    }
  }
}
