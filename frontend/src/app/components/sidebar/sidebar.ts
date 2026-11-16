import { Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth-service';
import { canReadDataset, canReadOrders, canReadRevenues, Role } from '../../core/roles';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  hint?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const CATALOG_PATHS = new Set(['/products', '/product-categories', '/geolocations']);

const BASE_SECTIONS: NavSection[] = [
  {
    title: 'Utama',
    items: [{ label: 'Dashboard', icon: 'dashboard', path: '/dashboard' }],
  },
  {
    title: 'Pesanan',
    items: [
      { label: 'Belum Dikirim', icon: 'local_shipping', path: '/shipping' },
      { label: 'Orders', icon: 'receipt_long', path: '/orders' },
      { label: 'Order Items', icon: 'list_alt', path: '/order-items' },
      { label: 'Payments', icon: 'payments', path: '/order-payments' },
      { label: 'Reviews', icon: 'star', path: '/order-reviews' },
    ],
  },
  {
    title: 'Data Master',
    items: [
      { label: 'Customers', icon: 'group', path: '/customers' },
      { label: 'Sellers', icon: 'storefront', path: '/sellers' },
      { label: 'Products', icon: 'inventory_2', path: '/products' },
      { label: 'Kategori Produk', icon: 'category', path: '/product-categories' },
      { label: 'Geolokasi', icon: 'location_on', path: '/geolocations' },
    ],
  },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly auth = inject(AuthService);
  readonly navigated = output<void>();

  protected readonly role = computed<Role | null>(() => this.auth.user()?.role ?? null);

  protected readonly sections = computed<NavSection[]>(() => {
    const role = this.role();
    return BASE_SECTIONS.map((section) => ({
      title: section.title,
      items: section.items.filter((item) => this.allowed(item.path, role)),
    })).filter((section) => section.items.length > 0);
  });

  private allowed(path: string, role: Role | null): boolean {
    if (CATALOG_PATHS.has(path)) return true;
    if (path === '/dashboard') return canReadRevenues(role);
    if (path === '/shipping') return canReadOrders(role);
    return canReadDataset(path.slice(1), role);
  }
}
