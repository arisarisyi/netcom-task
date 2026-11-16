export type Role = 'admin' | 'customers' | 'sellers';

export const ALL_ROLES: Role[] = ['admin', 'customers', 'sellers'];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ALL_ROLES as string[]).includes(value);
}

const DATASET_ROLES: Record<string, Role[]> = {
  products: ['admin', 'sellers'],
  orders: ['admin', 'customers'],
  'order-items': ['admin', 'customers'],
  'order-payments': ['admin', 'customers'],
  'order-reviews': ['admin', 'customers'],
  customers: ['admin'],
  sellers: ['admin'],
  'product-categories': ['admin'],
  geolocations: ['admin'],
};

export function canReadDataset(datasetKey: string, role: Role | null): boolean {
  if (!role) return false;
  if (role === 'admin') return true;
  const roles = DATASET_ROLES[datasetKey];
  return !roles || roles.includes(role);
}

export function canWriteDataset(datasetKey: string, role: Role | null): boolean {
  if (!role) return false;
  if (role === 'admin') return true;
  return DATASET_ROLES[datasetKey]?.includes(role) ?? false;
}

export function canReadRevenues(role: Role | null): boolean {
  return role === 'admin' || role === 'sellers';
}

export function canReadOrders(role: Role | null): boolean {
  return role === 'admin' || role === 'customers';
}

export function homeRoute(role: Role | null): string {
  if (role === 'customers') return '/orders';
  return '/dashboard';
}
