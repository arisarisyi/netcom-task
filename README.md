# NETCOM Technical Test — E-Commerce Dashboard

Dashboard fullstack.
Backend Express + PostgreSQL, frontend Angular Material. Semua service dijalankan dengan satu `docker compose up -d`.

## Cara Menjalankan

Prasyarat: Docker Desktop aktif. Tidak perlu install Node atau PostgreSQL di host.

```bash
docker compose up -d --build
```

Saat pertama kali dijalankan, service `db-dump` akan mengimpor dataset (~1,5 juta baris) ke PostgreSQL — proses ini butuh beberapa menit, pemanggilan berikutnya otomatis dilewati. Cek progresnya dengan `docker compose logs -f db-dump`.

Setelah selesai:

| Service    | Alamat                                              |
| ---------- | --------------------------------------------------- |
| Frontend   | http://localhost:4200                               |
| API        | http://localhost:3000                               |
| PostgreSQL | localhost:5432 (db `test_be`, user/pass `postgres`) |

Buka http://localhost:4200, login dengan salah satu akun berikut (sudah ada di dalam dump):

| Role      | Email                | Password     | Akses                                 |
| --------- | -------------------- | ------------ | ------------------------------------- |
| admin     | admin@example.com    | Admin123!    | Semua halaman                         |
| sellers   | seller@example.com   | Seller123!   | Dashboard revenue & anomali, products |
| customers | customer@example.com | Customer123! | Orders, pesanan belum dikirim         |

Registrasi akun baru juga tersedia di halaman login (default role `customers`).

Perintah lain yang berguna:

```bash
docker compose ps                        # status container
docker compose logs -f api               # log service tertentu
docker compose down                      # stop (data di volume tetap ada)
docker compose down -v                   # stop + hapus volume (import ulang saat up)
docker exec -it netcom-postgres psql -U postgres -d test_be
```

## Fitur

- Login JWT (bcrypt, token 1 jam) dengan tiga role: admin, sellers, customers. Setiap endpoint dilindungi middleware auth + role.
- CRUD 9 tabel dataset: customers, sellers, products, product_category_translation, geolocation, orders, order_items, order_payments, order_reviews. Semua table mendapat kolom audit (`created_at/by`, `updated_at/by`, `deleted_at/by`) dan soft delete via Sequelize `paranoid`.
- Grafik revenue harian per bulan/tahun (order berstatus `canceled` tidak dihitung).
- Deteksi anomali revenue harian dalam satu bulan pakai z-score; threshold bisa diatur via query param.
- Halaman pesanan yang belum dikirim (status `created`, `approved`, `invoiced`, `processing`).
- Semua request divalidasi dengan Zod; error handler terpusat dengan format respons `{ "data": ... }` / `{ "errors": ... }`.

## API

Endpoint secured butuh header `Authorization: Bearer <token>`.

Public:

- `POST /api/users` — registrasi
- `POST /api/login` — login, mengembalikan token

Secured:

- `GET /api/revenues/daily?year=2018&month=5`
- `GET /api/revenues/anomalies?year=2018&month=5&threshold=2`
- CRUD standar per resource: `GET/POST /api/{resource}`, `GET/PUT/DELETE /api/{resource}/{id}` (list mendukung `?page=&limit=&sort=&dir=`):

  `/api/product-categories`, `/api/geolocations`, `/api/customers`, `/api/sellers`, `/api/products`, `/api/orders`, `/api/order-items`, `/api/order-payments`, `/api/order-reviews`

  `order_items` dan `order_payments` punya composite key, mis. `/api/order-items/{order_id}/{order_item_id}`.

Koleksi Postman: `template-express/postman/collection.json`.

## Struktur

```
├── docker-compose.yml        postgres + db-dump (import dump sekali) + api + web
├── erd.png / erd.drawio      diagram ERD
├── template-express/         backend (Express 5 + Sequelize + Zod)
│   ├── src/                  controller → service → model
│   ├── schema.sql            DDL semua tabel
│   ├── olist_dump.sql.gz     dump database (terkompresi)
│   └── postman/
└── netcom/                   frontend (Angular 21 standalone + Material)
    └── src/app/              core (auth, crud-config), page (login, dashboard, shipping, crud)
```

Container `web` (Nginx) melayani SPA dan me-reverse-proxy `/api/*` ke `api`, jadi tidak ada masalah CORS. Untuk pengembangan tanpa Docker: backend `npm run dev` di `template-express/` (konfigurasi via `DATABASE_URL` di `.env`-nya), frontend `ng serve` di `netcom/` (proxy ke port 3000 via `proxy.conf.js`).

## Database & ERD

ERD: [erd.png](erd.png) (sumber [erd.drawio](erd.drawio), bisa dibuka di draw.io).

Dump database tersedia di `template-express/olist_dump.sql.gz` — diimpor otomatis oleh service `db-dump` saat `docker compose up` pertama kali. Versi mentah `olist_dump.sql` (~190MB) tidak dimasukkan ke git karena melewati batas 100MB GitHub; kalau butuh, decompress dengan `gunzip -k olist_dump.sql.gz`.

Catatan: file `.env` di root sengaja di-commit berisi konfigurasi development (password postgres, JWT secret dummy) supaya clone langsung bisa dijalankan tanpa setup apa pun. Jangan pakai nilai ini di production.

## Analytical & Operation Skills

Jawaban untuk Analytical & Operation Skills bisa di check di [analytical-operation-skill.txt](analytical-operation-skill.txt)

## Troubleshooting singkat

- `netcom-api` lama waiting → tunggu `db-dump` selesai (`docker compose logs -f db-dump`).
- Tabel kosong → `DB_DUMP=false` di `.env` atau volume lama tanpa data; jalankan `docker compose down -v && docker compose up -d`.
- Push ditolak karena file >100MB → pakai `olist_dump.sql.gz` (sudah dikonfigurasi di `.gitignore`).
