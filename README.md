# POS System Sederhana

Sistem Point of Sales (POS) dibangun dengan Next.js, SQLite, dan Prisma.

## Dokumentasi Pengembangan
- [01 - Inisialisasi Proyek](docs/01-setup.md)
- [02 - Database & Prisma](docs/02-database.md)
- [03 - Backend API](docs/03-backend-pos.md)
- [04 - Frontend Kasir](docs/04-frontend-pos.md)
- [05 - Fitur Foto Produk](docs/05-product-images.md)

## Getting Started

1.  Clone repo ini.
2.  Install dependencies: `npm install`
3.  Jalankan migrasi database: `npx prisma migrate dev`
4.  Seed database: `npx ts-node prisma/seed.ts`
5.  Jalankan server: `npm run dev`

