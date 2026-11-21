import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const transactions = await prisma.stockTransaction.findMany({
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const { productId, type, quantity, reason } = await request.json();
  
  const transaction = await prisma.stockTransaction.create({
    data: { productId: parseInt(productId), type, quantity: parseInt(quantity), reason },
  });

  const change = type === 'IN' ? parseInt(quantity) : -parseInt(quantity);
  await prisma.product.update({
    where: { id: parseInt(productId) },
    data: { stock: { increment: change } },
  });

  return NextResponse.json(transaction);
}