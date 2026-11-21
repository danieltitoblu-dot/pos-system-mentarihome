# 03 - Backend API

Membuat API untuk berinteraksi dengan database.

## API Route (`src/app/api/products/[barcode]/route.ts`)
Mengambil data produk berdasarkan barcode.

```typescript
// Menggunakan prisma untuk pencarian unik berdasarkan barcode
const product = await prisma.product.findUnique({
  where: { barcode },
});
```
