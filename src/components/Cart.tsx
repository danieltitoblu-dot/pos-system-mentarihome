'use client';
import { Trash2 } from 'lucide-react';

export default function Cart({ cart, total }: { cart: any[], total: number }) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-slate-800">Keranjang</h2>
      <div className="flex-1 overflow-y-auto space-y-4">
        {cart.map((item) => (
          <div key={item.product.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
            <div>
              <p className="font-medium text-slate-700">{item.product.name}</p>
              <p className="text-sm text-slate-500">{item.quantity} x Rp{item.product.price.toLocaleString()}</p>
            </div>
            <p className="font-bold text-slate-800">Rp{(item.product.price * item.quantity).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-bold text-slate-600">Total</span>
          <span className="text-2xl font-bold text-blue-600">Rp{total.toLocaleString()}</span>
        </div>
        <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
          Bayar Sekarang
        </button>
      </div>
    </div>
  );
}