const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const products = await prisma.product.findMany();
    console.log('products count', products.length);
    const sales = await prisma.stockTransaction.groupBy({
      by: ['productId'],
      where: { type: 'OUT', reason: 'Penjualan' },
      _sum: { quantity: true }
    });
    console.log('sales group', sales.length);
    console.log('OK');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
