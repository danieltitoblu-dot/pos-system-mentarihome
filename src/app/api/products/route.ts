import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      transactions: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  const productsWithCost = products.map(product => {
    const stockIns = product.transactions.filter(t => t.type === 'IN');
    const stockOuts = product.transactions.filter(t => t.type === 'OUT');

    let currentCost = product.price;
    for (const stockIn of stockIns) {
      const outFromThisBatch = stockOuts
        .filter(out => out.createdAt >= stockIn.createdAt)
        .reduce((sum, out) => sum + out.quantity, 0);
      const available = stockIn.quantity - outFromThisBatch;
      if (available > 0) {
        currentCost = stockIn.costPrice || product.price;
        break;
      }
    }

    return {
      id: product.id,
      barcode: product.barcode,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: product.image,
      costPrice: currentCost,
    };
  });

  return NextResponse.json(productsWithCost);
}

export async function POST(request: Request) {
  const body = await request.json();
  const product = await prisma.product.create({
    data: {
      barcode: body.barcode,
      name: body.name,
      price: parseFloat(body.price),
      stock: parseInt(body.stock),
      image: body.image || null,
    },
  });

  if (product.stock > 0) {
    await prisma.stockTransaction.create({
      data: {
        productId: product.id,
        type: 'IN',
        quantity: product.stock,
        costPrice: product.price,
        reason: 'Stok Awal',
      },
    });
  }

  return NextResponse.json(product, { status: 201 });
}
