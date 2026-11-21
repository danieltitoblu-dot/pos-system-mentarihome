import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper untuk mendapatkan produk berdasarkan 'id' atau 'barcode'
async function getProduct(idOrBarcode: string) {
  // Coba cari by ID (numeric)
  const id = parseInt(idOrBarcode);
  if (!isNaN(id)) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (product) return product;
  }
  // Coba cari by barcode
  return await prisma.product.findUnique({ where: { barcode: idOrBarcode } });
}

// GET: Mendapatkan satu produk (bisa pakai ID atau barcode)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
  }
  return NextResponse.json(product);
}

// PUT: Update produk
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const updatedProduct = await prisma.product.update({
    where: { id: parseInt(id) },
    data: {
      barcode: body.barcode,
      name: body.name,
      price: parseFloat(body.price),
      stock: parseInt(body.stock),
      image: body.image || null,
    },
  });
  return NextResponse.json(updatedProduct);
}

// DELETE: Hapus produk
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ message: 'Produk dihapus' });
}