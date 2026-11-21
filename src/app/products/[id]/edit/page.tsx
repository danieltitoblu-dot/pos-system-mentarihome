'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

function EditProductForm() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState({ name: '', barcode: '', price: 0, stock: 0, image: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const item = data.find((p: any) => p.id.toString() === id);
        if (item) setProduct(item);
        setLoading(false);
      });
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProduct(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    router.push('/products');
  };

  if (loading) return <p className="p-8 text-center text-slate-500">Memuat data...</p>;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
      <input className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={product.barcode} onChange={e => setProduct({...product, barcode: e.target.value})} placeholder="Barcode" />
      <input className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={product.name} onChange={e => setProduct({...product, name: e.target.value})} placeholder="Nama Produk" />
      <input type="number" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={product.price} onChange={e => setProduct({...product, price: parseFloat(e.target.value)})} placeholder="Harga" />
      <input type="number" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={product.stock} onChange={e => setProduct({...product, stock: parseInt(e.target.value)})} placeholder="Stok" />
      
      <div>
        <label className="block text-sm font-medium mb-1">Foto Produk</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
        {product.image && <img src={product.image} alt="Preview" className="w-24 h-24 object-cover mt-2 rounded" />}
      </div>

      <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition">Simpan Perubahan</button>
    </form>
  );
}

export default function EditProductPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Edit Produk</h1>
      <Suspense fallback={<p className="text-center py-10 text-slate-500">Memuat form...</p>}>
        <EditProductForm />
      </Suspense>
    </div>
  );
}
