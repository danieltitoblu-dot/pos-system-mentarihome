'use client';
import { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  costPrice?: number;
}

interface Transaction {
  id: number;
  type: 'IN' | 'OUT';
  quantity: number;
  costPrice?: number | null;
  reason: string;
  createdAt: string;
  product: { name: string };
}

export default function StockPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'IN' | 'OUT'>('IN');
  const [form, setForm] = useState({ productId: '', quantity: '', costPrice: '', reason: '' });

  const fetchData = () => {
    fetch('/api/stock').then(res => res.json()).then(setTransactions);
    fetch('/api/products').then(res => res.json()).then(setProducts);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...form, 
        type: modalType,
        costPrice: modalType === 'IN' ? parseFloat(form.costPrice || '0') : null 
      }),
    });
    setIsModalOpen(false);
    setForm({ productId: '', quantity: '', costPrice: '', reason: '' });
    fetchData();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Stok (FIFO)</h1>
        <div className="flex gap-3">
          <button onClick={() => { setModalType('IN'); setIsModalOpen(true); }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition">
            <PlusCircle size={18} /> Stok Masuk (IN)
          </button>
          <button onClick={() => { setModalType('OUT'); setIsModalOpen(true); }} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition">
            <MinusCircle size={18} /> Stok Keluar (OUT)
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold text-slate-800">{modalType === 'IN' ? 'Tambah Stok Masuk (FIFO Batch)' : 'Tambah Stok Keluar'}</h2>
            <select className="w-full p-3 border rounded-lg" onChange={(e) => setForm({ ...form, productId: e.target.value })} required>
              <option value="">Pilih Produk</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>)}
            </select>
            <input type="number" className="w-full p-3 border rounded-lg" placeholder="Jumlah" onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            {modalType === 'IN' && (
              <input type="number" step="any" className="w-full p-3 border rounded-lg" placeholder="Harga Beli Per Unit (Cost Price)" onChange={(e) => setForm({ ...form, costPrice: e.target.value })} required />
            )}
            <input className="w-full p-3 border rounded-lg" placeholder="Alasan / Keterangan Supplier" onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Batal</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Simpan</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Tanggal</th>
              <th className="p-4 font-semibold text-slate-600">Produk</th>
              <th className="p-4 font-semibold text-slate-600">Tipe</th>
              <th className="p-4 font-semibold text-slate-600">Jumlah</th>
              <th className="p-4 font-semibold text-slate-600">Harga Beli (Cost)</th>
              <th className="p-4 font-semibold text-slate-600">Alasan</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-slate-50 transition">
                <td className="p-4 text-slate-600 text-sm">{new Date(tx.createdAt).toLocaleString()}</td>
                <td className="p-4 font-medium text-slate-800">{tx.product?.name}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tx.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {tx.type === 'IN' ? 'Masuk' : 'Keluar'}
                  </span>
                </td>
                <td className="p-4 font-bold text-slate-800">{tx.quantity}</td>
                <td className="p-4 text-slate-700">{tx.costPrice ? `Rp${tx.costPrice.toLocaleString()}` : '-'}</td>
                <td className="p-4 text-slate-600 text-sm">{tx.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
