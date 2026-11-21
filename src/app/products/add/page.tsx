'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', barcode: '', price: 0, stock: 0 });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    router.push('/products');
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Tambah Produk Baru</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <input className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" onChange={e => setForm({...form, barcode: e.target.value})} placeholder="Barcode" />
        <input className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" onChange={e => setForm({...form, name: e.target.value})} placeholder="Nama Produk" />
        <input type="number" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" onChange={e => setForm({...form, price: parseInt(e.target.value) || 0})} placeholder="Harga" />
        <input type="number" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})} placeholder="Stok" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition">Simpan</button>
      </form>
    </div>
  );
}