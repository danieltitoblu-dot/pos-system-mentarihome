import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.product.deleteMany()
  await prisma.stockTransaction.deleteMany()

  const products = Array.from({ length: 10 }).map((_, i) => ({
    barcode: `10000000000${i}`,
    name: `Produk Sampel ${i + 1}`,
    price: (i + 1) * 5000,
    stock: 0, // Stok awal 0, akan diisi via Manajemen Stok
    image: null,
  }))

  await prisma.product.createMany({ data: products })

  // Buat semua produk dulu untuk referensi ID
  const createdProducts = await prisma.product.findMany()

  // Sample Stok Masuk (IN)
  await prisma.stockTransaction.create({
    data: {
      productId: createdProducts[0].id,
      type: 'IN',
      quantity: 100,
      reason: 'Pembelian awal dari supplier',
    },
  })

  // Sample Stok Masuk (IN)
  await prisma.stockTransaction.create({
    data: {
      productId: createdProducts[1].id,
      type: 'IN',
      quantity: 50,
      reason: 'Restock mingguan',
    },
  })

  // Sample Stok Keluar (OUT)
  await prisma.stockTransaction.create({
    data: {
      productId: createdProducts[2].id,
      type: 'OUT',
      quantity: 10,
      reason: 'Barang rusak / return',
    },
  })

  // Sample Stok Keluar (OUT)
  await prisma.stockTransaction.create({
    data: {
      productId: createdProducts[0].id,
      type: 'OUT',
      quantity: 5,
      reason: 'Sample untuk pelanggan',
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
