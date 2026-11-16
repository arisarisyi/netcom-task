import { Routes } from '@angular/router';
import { Login } from './page/login/login';
import { Dashboard } from './page/dashboard/dashboard';
import { Layout } from './layout/layout';
import { Crud } from './page/crud/crud';
import { Shipping } from './page/shipping/shipping';
import { roleGuard } from './core/auth-guard';
import { ALL_ROLES, Role } from './core/roles';

const ROLES_BY_DATASET: Record<string, Role[]> = {
  customers: ['admin'],
  sellers: ['admin'],
  orders: ['admin', 'customers'],
  'order-items': ['admin', 'customers'],
  'order-payments': ['admin', 'customers'],
  'order-reviews': ['admin', 'customers'],
};

const dataset = (key: string, title: string) => ({
  path: key,
  component: Crud,
  data: { dataset: key },
  title,
  canActivate: [roleGuard(...(ROLES_BY_DATASET[key] ?? ALL_ROLES))],
});

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: Login, title: 'Login - Dashboard' },
  {
    path: '',
    component: Layout,
    canActivate: [roleGuard(...ALL_ROLES)],
    children: [
      { path: 'dashboard', component: Dashboard, title: 'Dashboard', canActivate: [roleGuard('admin', 'sellers')] },
      { path: 'shipping', component: Shipping, title: 'Pesanan Belum Dikirim', canActivate: [roleGuard('admin', 'customers')] },
      dataset('customers', 'Customers'),
      dataset('sellers', 'Sellers'),
      dataset('products', 'Products'),
      dataset('product-categories', 'Kategori Produk'),
      dataset('geolocations', 'Geolokasi'),
      dataset('orders', 'Orders'),
      dataset('order-items', 'Order Items'),
      dataset('order-payments', 'Order Payments'),
      dataset('order-reviews', 'Order Reviews'),
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
