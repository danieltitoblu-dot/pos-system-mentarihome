import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const product = await prisma.product.create({
    data: {
      barcode: body.barcode,
      name: body.name,
      price: parseFloat(body.price),
      stock: parseInt(body.stock),
    },
  });
  return NextResponse.json(product, { status: 201 });
}
