import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany();

  // Get sales data (OUT transactions with reason Penjualan)
  const sales = await prisma.stockTransaction.groupBy({
    by: ['productId'],
    where: {
      type: 'OUT',
      reason: 'Penjualan',
    },
    _sum: { quantity: true },
  });

  const salesMap = new Map(sales.map(s => [s.productId, s._sum.quantity || 0]));

  const productsWithSales = products.map(p => ({
    id: p.id,
    name: p.name,
    barcode: p.barcode,
    price: p.price,
    stock: p.stock,
    soldQuantity: salesMap.get(p.id) || 0,
    revenue: (salesMap.get(p.id) || 0) * p.price,
  }));

  const bestSelling = productsWithSales
    .sort((a, b) => b.soldQuantity - a.soldQuantity)
    .slice(0, 25);

  const leastSelling = productsWithSales
    .sort((a, b) => a.soldQuantity - b.soldQuantity)
    .slice(0, 25);

  // Sales report by day (last 30 days)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const dailySales = await prisma.stockTransaction.findMany({
    where: {
      type: 'OUT',
      reason: 'Penjualan',
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
      quantity: true,
      product: { select: { price: true } },
    },
  });

  const dailyMap = new Map<string, { quantity: number; revenue: number }>();
  dailySales.forEach(tx => {
    const date = new Date(tx.createdAt).toISOString().split('T')[0];
    const prev = dailyMap.get(date) || { quantity: 0, revenue: 0 };
    dailyMap.set(date, {
      quantity: prev.quantity + tx.quantity,
      revenue: prev.revenue + tx.quantity * tx.product.price,
    });
  });

  const salesReport = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalSales = {
    totalQuantity: dailySales.reduce((sum, tx) => sum + tx.quantity, 0),
    totalRevenue: dailySales.reduce((sum, tx) => sum + tx.quantity * tx.product.price, 0),
    totalProductsSold: productsWithSales.filter(p => p.soldQuantity > 0).length,
  };

  return NextResponse.json({
    bestSelling,
    leastSelling,
    salesReport,
    totalSales,
  });
}
