# 02 - Setup Database

Menggunakan SQLite sebagai database lokal yang mudah dikelola.

## Konfigurasi Prisma
Inisialisasi Prisma:
```bash
npx prisma init
```

## Model Database (`prisma/schema.prisma`)
```prisma
model Product {
  id        Int      @id @default(autoincrement())
  barcode   String   @unique
  name      String
  price     Float
  stock     Int
  image     String?
  createdAt DateTime @default(now())
}

// ... model Transaction dan TransactionItem
```

## Migrasi
```bash
npx prisma migrate dev --name init
```
