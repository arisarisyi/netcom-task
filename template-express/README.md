# E-Commerce API — Olist Dataset

REST API untuk data e-commerce Olist, dibangun dengan TypeScript, Express 5, dan PostgreSQL (Sequelize). Autentikasi JWT dengan role-based access (`admin`, `customers`, `sellers`).

Dokumentasi lengkap seluruh sistem (database, backend, frontend sekaligus via Docker Compose) ada di [README root](../README.md). README ini khusus backend.

## Struktur Data

Database `test_be` berisi tabel `users` (aplikasi) dan 9 tabel dataset Olist. DDL lengkap di [schema.sql](schema.sql); seluruh isi database tersedia dalam satu file dump [olist_dump.sql](olist_dump.sql) (di repo dalam bentuk terkompresi `olist_dump.sql.gz`).

Beberapa catatan data:

- `geolocation` (1 juta+ baris) diberi PK auto increment `geolocation_id` karena CSV aslinya punya banyak baris duplikat persis.
- `order_items` dan `order_payments` memakai PK komposit (`order_id` + `order_item_id` / `payment_sequential`), sesuai bentuk data aslinya.
- `order_reviews` sudah di-dedup (814 `review_id` duplikat dibuang, dipertahankan yang terbaru).
- `product_category_translation` berisi 73 kategori (71 dari CSV + 2 tambahan agar FK `products` tetap valid).
- Setiap tabel punya kolom audit `created_by/at`, `updated_by/at`, `deleted_by/at`. Kolom `*_by` merujuk ke `users.id` dan bernilai NULL untuk baris hasil import CSV. Soft delete dikelola Sequelize `paranoid`.

Dump menyertakan 3 akun contoh (password bcrypt, hanya untuk development):

| Role | Email | Password |
|---|---|---|
| admin | admin@example.com | Admin123! |
| customers | customer@example.com | Customer123! |
| sellers | seller@example.com | Seller123! |

## Menjalankan

### Via Docker Compose (dari root project)

```bash
docker compose up --build
```

Service `db-dump` mengimpor dump ke Postgres saat `DB_DUMP=true` (hanya sekali, ditandai tabel `_olist_dump_loaded`). Catatan: import ulang me-reset schema `public` termasuk tabel `users`.

### Langsung di host

```bash
cp .env.example .env    # isi DATABASE_URL, JWT_SECRET, dst.
npm install
npm run dev             # development (nodemon + ts-node)
# atau
npm run build && npm start
```

API jalan di `http://localhost:3000`.

### Restore database secara manual

```bash
createdb test_be
npm run db:restore      # psql "$DATABASE_URL" -f olist_dump.sql
```

Untuk memuat ulang dari nol: `psql "$DATABASE_URL" -c 'drop schema public cascade; create schema public;'` lalu restore lagi.

## API

Semua endpoint berprefix `/api`, format JSON. Endpoint secured butuh header `Authorization: Bearer <token>` dari login.

### Register — `POST /api/users` (public)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Budi", "email": "budi@example.com", "password": "rahasia123", "role": "customers"}'
```

Response `200`: `{ "name": "Budi", "email": "budi@example.com" }`. Role valid: `admin`, `customers`, `sellers` (default `customers`). Email duplikat → `400 Email already exists`.

### Login — `POST /api/login` (public)

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "budi@example.com", "password": "rahasia123"}'
```

Response `200`: `{ "name": ..., "email": ..., "token": "eyJ..." }` (token berlaku 1 jam). Kredensial salah → `401`.

### Revenue harian — `GET /api/revenues/daily` (secured)

`SUM(price + freight_value)` dari `order_items` per tanggal `order_purchase_timestamp`; order `canceled` tidak dihitung; hari tanpa pesanan tetap dikembalikan dengan `revenue: 0` agar grafik lengkap.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/revenues/daily?month=1&year=2018"
```

```json
{ "data": { "month": 1, "year": 2018, "data": [
  { "date": "2018-01-01", "revenue": 8391.92, "order_count": 73 },
  { "date": "2018-01-02", "revenue": 29410.51, "order_count": 203 }
] } }
```

### Anomali revenue — `GET /api/revenues/anomalies` (secured)

Menghitung mean dan standar deviasi revenue harian satu bulan (termasuk hari tanpa pesanan bernilai 0), lalu menandai hari dengan |z-score| > threshold sebagai anomali. `direction: "below"` = revenue janggal rendah, `"above"` = lonjakan. Query params: `month`, `year`, `threshold` (opsional, default 2, rentang 0.1–10).

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/revenues/anomalies?month=1&year=2018"
```

```json
{ "data": { "month": 1, "year": 2018, "threshold": 2, "mean": 35545.81, "std_dev": 7893.99,
  "anomaly_count": 1, "data": [
  { "date": "2018-01-01", "revenue": 8391.92, "order_count": 73, "z_score": -3.44,
    "is_anomaly": true, "direction": "below" }
] } }
```

Pada data aktual, 1 Januari 2018 terdeteksi anomali rendah — revenue libur Tahun Baru jauh di bawah rata-rata.

### CRUD dataset — `/api/<resource>` (secured)

Resource: `product-categories`, `geolocations`, `customers`, `sellers`, `products`, `orders`, `order-items`, `order-payments`, `order-reviews`.

Operasi standar: `GET /api/{resource}?page=1&limit=20` (list, maks limit 100), `GET /api/{resource}/:id`, `POST`, `PUT /:id` (partial update), `DELETE /:id` (soft delete). Kolom audit `created_by`/`updated_by`/`deleted_by` diisi otomatis dari user yang login.

`order-items` memakai composite key: `/api/order-items/:order_id/:order_item_id`; `order-payments`: `/api/order-payments/:order_id/:payment_sequential`.

Hak akses per role (admin selalu punya akses penuh):

| Endpoint | sellers | customers |
|---|---|---|
| `GET /api/revenues/*` | ya | tidak |
| tulis `products` | ya | tidak |
| `orders`, `order-items`, `order-payments`, `order-reviews` | tidak | ya |
| CRUD `customers`, `sellers` (data master) | tidak | tidak |
| tulis `product-categories`, `geolocations` | tidak | tidak |
| baca `products`, `product-categories`, `geolocations` | ya | ya |

Contoh:

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/customers?limit=2&page=2"

curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"customer_id":"...", "customer_unique_id":"...", "customer_zip_code_prefix":"12345", "customer_city":"jakarta", "customer_state":"JK"}'
```

Body tidak valid → `400` dengan detail per field; duplikat PK → `400 Data already exists`; FK tidak ada → `400 Related data not found`; role tanpa akses → `403`.

Format error terpusat: validasi Zod → `{ "message": "Validation failed", "errors": [{ "path", "message" }] }`, error lain → `{ "errors": "<pesan>" }`.

Koleksi Postman siap pakai: [postman/collection.json](postman/collection.json).

## Perintah

```bash
npm run dev          # development server
npm run build        # compile TypeScript ke dist/
npm start            # jalankan hasil build
npm run db:restore   # restore olist_dump.sql ke $DATABASE_URL

docker compose up --build     # build + jalankan semua service (dari root)
docker compose logs db-dump   # log import dump

# paksa import ulang dump dari nol:
docker exec netcom-postgres psql -U postgres -d test_be -c 'DROP TABLE IF EXISTS public._olist_dump_loaded'
docker compose up -d db-dump
```
