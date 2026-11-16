export interface CrudField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'datetime' | 'textarea';
  required?: boolean;
  nullable?: boolean;
  options?: { value: string; label: string }[];
  hideInTable?: boolean;
  hideInForm?: boolean;
  maxLength?: number;
  autoId?: boolean;
  format?: 'datetime' | 'currency' | 'number';
  hint?: string;
}

export interface CrudDataset {
  key: string;
  title: string;
  endpoint: string;
  icon: string;
  idKeys: string[];
  autoIncrement?: boolean;
  fields: CrudField[];
}

export const ORDER_STATUSES = [
  'created', 'approved', 'invoiced', 'processing', 'shipped', 'delivered', 'canceled', 'unavailable',
];

export const UNSHIPPED_STATUSES = ['created', 'approved', 'invoiced', 'processing'];

const hex32 = (): string => {
  let s = '';
  for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
};

export const DATASETS: Record<string, CrudDataset> = {
  customers: {
    key: 'customers',
    title: 'Customers',
    endpoint: '/api/customers',
    icon: 'group',
    idKeys: ['customer_id'],
    fields: [
      { key: 'customer_id', label: 'ID Customer', type: 'text', required: true, maxLength: 32, autoId: true, hint: '32 karakter' },
      { key: 'customer_unique_id', label: 'Unique ID', type: 'text', required: true, maxLength: 32, autoId: true },
      { key: 'customer_zip_code_prefix', label: 'Kode Pos', type: 'text', required: true, maxLength: 10 },
      { key: 'customer_city', label: 'Kota', type: 'text', required: true, maxLength: 120 },
      { key: 'customer_state', label: 'Provinsi', type: 'text', required: true, maxLength: 2, hint: 'Kode 2 huruf, mis. SP' },
    ],
  },
  sellers: {
    key: 'sellers',
    title: 'Sellers',
    endpoint: '/api/sellers',
    icon: 'storefront',
    idKeys: ['seller_id'],
    fields: [
      { key: 'seller_id', label: 'ID Seller', type: 'text', required: true, maxLength: 32, autoId: true, hint: '32 karakter' },
      { key: 'seller_zip_code_prefix', label: 'Kode Pos', type: 'text', required: true, maxLength: 10 },
      { key: 'seller_city', label: 'Kota', type: 'text', required: true, maxLength: 120 },
      { key: 'seller_state', label: 'Provinsi', type: 'text', required: true, maxLength: 2, hint: 'Kode 2 huruf, mis. SP' },
    ],
  },
  products: {
    key: 'products',
    title: 'Products',
    endpoint: '/api/products',
    icon: 'inventory_2',
    idKeys: ['product_id'],
    fields: [
      { key: 'product_id', label: 'ID Produk', type: 'text', required: true, maxLength: 32, autoId: true, hint: '32 karakter' },
      { key: 'product_category_name', label: 'Kategori', type: 'text', nullable: true, maxLength: 80 },
      { key: 'product_name_lenght', label: 'Panjang Nama', type: 'number', nullable: true },
      { key: 'product_description_lenght', label: 'Panjang Deskripsi', type: 'number', nullable: true },
      { key: 'product_photos_qty', label: 'Jumlah Foto', type: 'number', nullable: true },
      { key: 'product_weight_g', label: 'Berat (g)', type: 'number', nullable: true },
      { key: 'product_length_cm', label: 'Panjang (cm)', type: 'number', nullable: true },
      { key: 'product_height_cm', label: 'Tinggi (cm)', type: 'number', nullable: true },
      { key: 'product_width_cm', label: 'Lebar (cm)', type: 'number', nullable: true },
    ],
  },
  'product-categories': {
    key: 'product-categories',
    title: 'Kategori Produk',
    endpoint: '/api/product-categories',
    icon: 'category',
    idKeys: ['product_category_name'],
    fields: [
      { key: 'product_category_name', label: 'Nama (Indonesia)', type: 'text', required: true, maxLength: 80 },
      { key: 'product_category_name_english', label: 'Nama (Inggris)', type: 'text', required: true, maxLength: 80 },
    ],
  },
  geolocations: {
    key: 'geolocations',
    title: 'Geolokasi',
    endpoint: '/api/geolocations',
    icon: 'location_on',
    idKeys: ['geolocation_id'],
    autoIncrement: true,
    fields: [
      { key: 'geolocation_id', label: 'ID', type: 'number', hideInForm: true, format: 'number' },
      { key: 'geolocation_zip_code_prefix', label: 'Kode Pos', type: 'text', required: true, maxLength: 10 },
      { key: 'geolocation_lat', label: 'Latitude', type: 'number', required: true },
      { key: 'geolocation_lng', label: 'Longitude', type: 'number', required: true },
      { key: 'geolocation_city', label: 'Kota', type: 'text', required: true, maxLength: 120 },
      { key: 'geolocation_state', label: 'Provinsi', type: 'text', required: true, maxLength: 2, hint: 'Kode 2 huruf, mis. SP' },
    ],
  },
  orders: {
    key: 'orders',
    title: 'Orders',
    endpoint: '/api/orders',
    icon: 'receipt_long',
    idKeys: ['order_id'],
    fields: [
      { key: 'order_id', label: 'ID Order', type: 'text', required: true, maxLength: 32, autoId: true, hint: '32 karakter' },
      { key: 'customer_id', label: 'ID Customer', type: 'text', required: true, maxLength: 32 },
      {
        key: 'order_status',
        label: 'Status',
        type: 'select',
        required: true,
        options: ORDER_STATUSES.map((s) => ({ value: s, label: s })),
      },
      { key: 'order_purchase_timestamp', label: 'Tanggal Beli', type: 'datetime', required: true },
      { key: 'order_approved_at', label: 'Disetujui', type: 'datetime', nullable: true },
      { key: 'order_delivered_carrier_date', label: 'Kirim ke Kurir', type: 'datetime', nullable: true },
      { key: 'order_delivered_customer_date', label: 'Diterima Customer', type: 'datetime', nullable: true },
      { key: 'order_estimated_delivery_date', label: 'Estimasi Tiba', type: 'datetime', required: true },
    ],
  },
  'order-items': {
    key: 'order-items',
    title: 'Order Items',
    endpoint: '/api/order-items',
    icon: 'list_alt',
    idKeys: ['order_id', 'order_item_id'],
    fields: [
      { key: 'order_id', label: 'ID Order', type: 'text', required: true, maxLength: 32 },
      { key: 'order_item_id', label: 'No. Item', type: 'number', required: true },
      { key: 'product_id', label: 'ID Produk', type: 'text', required: true, maxLength: 32 },
      { key: 'seller_id', label: 'ID Seller', type: 'text', required: true, maxLength: 32 },
      { key: 'shipping_limit_date', label: 'Batas Kirim', type: 'datetime', required: true },
      { key: 'price', label: 'Harga', type: 'number', required: true, format: 'currency' },
      { key: 'freight_value', label: 'Ongkir', type: 'number', required: true, format: 'currency' },
    ],
  },
  'order-payments': {
    key: 'order-payments',
    title: 'Order Payments',
    endpoint: '/api/order-payments',
    icon: 'payments',
    idKeys: ['order_id', 'payment_sequential'],
    fields: [
      { key: 'order_id', label: 'ID Order', type: 'text', required: true, maxLength: 32 },
      { key: 'payment_sequential', label: 'Seq', type: 'number', required: true },
      {
        key: 'payment_type',
        label: 'Tipe Pembayaran',
        type: 'select',
        required: true,
        options: ['credit_card', 'boleto', 'voucher', 'debit_card', 'not_defined'].map((s) => ({ value: s, label: s })),
      },
      { key: 'payment_installments', label: 'Cicilan', type: 'number', nullable: true },
      { key: 'payment_value', label: 'Nilai', type: 'number', required: true, format: 'currency' },
    ],
  },
  'order-reviews': {
    key: 'order-reviews',
    title: 'Order Reviews',
    endpoint: '/api/order-reviews',
    icon: 'star',
    idKeys: ['review_id'],
    fields: [
      { key: 'review_id', label: 'ID Review', type: 'text', required: true, maxLength: 32, autoId: true, hint: '32 karakter' },
      { key: 'order_id', label: 'ID Order', type: 'text', required: true, maxLength: 32 },
      { key: 'review_score', label: 'Skor', type: 'select', required: true, options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) })) },
      { key: 'review_comment_title', label: 'Judul Komentar', type: 'text', nullable: true, maxLength: 120 },
      { key: 'review_comment_message', label: 'Isi Komentar', type: 'textarea', nullable: true },
      { key: 'review_creation_date', label: 'Dibuat', type: 'datetime', required: true },
      { key: 'review_answer_timestamp', label: 'Dijawab', type: 'datetime', required: true },
    ],
  },
};

export function newId(): string {
  return hex32();
}
