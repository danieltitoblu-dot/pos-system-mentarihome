import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { items } = await request.json(); // items: [{ productId, quantity, sellingPrice }]
  
  // Start transaction
  const results = [];
  
  for (const item of items) {
    // Get all IN stock transactions for this product ordered by createdAt (FIFO)
    const stockIns = await prisma.stockTransaction.findMany({
      where: {
        productId: item.productId,
        type: 'IN',
      },
      orderBy: { createdAt: 'asc' },
    });
    
    // Get all OUT stock transactions for this product
    const stockOuts = await prisma.stockTransaction.findMany({
      where: {
        productId: item.productId,
        type: 'OUT',
      },
    });
    
    // Calculate remaining stock with FIFO batches
    let remainingNeeded = item.quantity;
    let totalCost = 0;
    const batchesToDeduct = [];
    
    for (const stockIn of stockIns) {
      if (remainingNeeded <= 0) break;
      
      // Calculate how much is left from this batch
      const outFromThisBatch = stockOuts
        .filter(out => out.createdAt >= stockIn.createdAt)
        .reduce((sum, out) => sum + out.quantity, 0);
      
      const availableFromBatch = stockIn.quantity - outFromThisBatch;
      
      if (availableFromBatch > 0) {
        const deductFromThisBatch = Math.min(availableFromBatch, remainingNeeded);
        batchesToDeduct.push({
          stockInId: stockIn.id,
          quantity: deductFromThisBatch,
          costPrice: stockIn.costPrice || 0,
        });
        totalCost += deductFromThisBatch * (stockIn.costPrice || 0);
        remainingNeeded -= deductFromThisBatch;
      }
    }
    
    if (remainingNeeded > 0) {
      return NextResponse.json({ 
        error: `Stok tidak mencukupi untuk produk ID ${item.productId}. Kurang ${remainingNeeded} unit.` 
      }, { status: 400 });
    }
    
    // Validate selling price >= cost price (FIFO average or first batch)
    const firstBatchCost = batchesToDeduct[0]?.costPrice || 0;
    if (item.sellingPrice < firstBatchCost) {
      return NextResponse.json({ 
        error: `Harga jual tidak boleh kurang dari harga beli (Rp${firstBatchCost.toLocaleString()})` 
      }, { status: 400 });
    }
    
    // Create OUT stock transactions for each batch
    for (const batch of batchesToDeduct) {
      await prisma.stockTransaction.create({
        data: {
          productId: item.productId,
          type: 'OUT',
          quantity: batch.quantity,
          costPrice: batch.costPrice,
          reason: 'Penjualan',
        },
      });
    }
    
    results.push({
      productId: item.productId,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice,
      totalCost,
    });
  }
  
  return NextResponse.json({ success: true, items: results });
}