'use client';
import { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

export default function StockPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'IN' | 'OUT'>('IN');
  const [form, setForm] = useState({ productId: '', quantity: '', reason: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch('/api/stock')
      .then(res => res.json())
      .then(setTransactions);
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  };

  const openModal = (type: 'IN' | 'OUT') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, type: modalType }),
    });
    setIsModalOpen(false);
    setForm({ productId: '', quantity: '', reason: '' });
    fetchData();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Stok</h1>
        <div className="flex gap-3">
          <button
            onClick={() => openModal('IN')}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition"
          >
            <PlusCircle size={18} />
            Stok Masuk
          </button>
          <button
            onClick={() => openModal('OUT')}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition"
          >
            <MinusCircle size={18} />
            Stok Keluar
          </button>
        </div>
      </div>

      {/* Modal Input */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold text-slate-800">
              {modalType === 'IN' ? 'Tambah Stok Masuk' : 'Tambah Stok Keluar'}
            </h2>
            <select
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              required
            >
              <option value="">Pilih Produk</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Jumlah"
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
            <input
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Alasan"
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Riwayat */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Produk</th>
              <th className="p-4 font-semibold text-slate-600">Tipe</th>
              <th className="p-4 font-semibold text-slate-600">Jumlah</th>
              <th className="p-4 font-semibold text-slate-600">Alasan</th>
              <th className="p-4 font-semibold text-slate-600">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition">
                <td className="p-4 text-slate-800">{t.product?.name || '-'}</td>
                <td className={`p-4 font-bold ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'IN' ? 'MASUK' : 'KELUAR'}
                </td>
                <td className="p-4">{t.quantity}</td>
                <td className="p-4">{t.reason}</td>
                <td className="p-4 text-slate-500 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}