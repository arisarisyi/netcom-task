# Netcom — Frontend Dashboard

Frontend Angular 21 (standalone components + signals) + Angular Material untuk aplikasi **NETCOM E-Commerce Dashboard**. Dokumentasi lengkap cara menjalankan seluruh sistem (database, backend, frontend) tersedia di [README root](../README.md).

## Menjalankan mode development

```bash
npm install
npm start        # ng serve, terbuka di http://localhost:4200
```

Proxy `/api` ke backend (`http://localhost:3000`) dikonfigurasi di [proxy.conf.js](proxy.conf.js), jadi backend perlu berjalan terlebih dahulu.

## Build production

```bash
npm run build    # hasil build di dist/
```

## Unit test

```bash
npm test         # Vitest + jsdom
```

## Struktur singkat

- `src/app/core/` — auth service, guard, interceptor, dan konfigurasi CRUD generik (`crud-config.ts`)
- `src/app/page/` — halaman login, dashboard (grafik revenue & anomali), shipping, dan CRUD
- `src/app/components/`, `src/app/layout/` — sidebar, navbar, dan layout shell
