'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Barcode, Camera, Plus } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface Product {
  id: number;
  barcode: string;
  name: string;
  price: number;
  stock: number;
  image?: string | null;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); });
  }, []);

  const deleteProduct = async (id: number) => {
    if (!confirm('Yakin hapus produk ini?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setProducts(products.filter(p => p.id !== id));
  };

  const startScanner = async () => {
    setIsScannerOpen(true);
    setTimeout(async () => {
      const readerEl = document.getElementById('reader');
      if (!readerEl) {
        alert("Elemen scanner tidak ditemukan");
        setIsScannerOpen(false);
        return;
      }
      html5QrcodeRef.current = new Html5Qrcode("reader");
      try {
        await html5QrcodeRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            setBarcodeInput(decodedText);
            setIsScannerOpen(false);
            html5QrcodeRef.current?.stop().then(() => html5QrcodeRef.current?.clear());
          },
          () => {}
        );
      } catch {
        alert("Gagal mengakses kamera.");
        setIsScannerOpen(false);
      }
    }, 300);
  };

  const stopScanner = () => {
    setIsScannerOpen(false);
    html5QrcodeRef.current?.stop().then(() => html5QrcodeRef.current?.clear());
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Master Item</h1>
        <button onClick={() => router.push('/products/add')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition">
          + Tambah Produk
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-slate-600">Barcode</label>
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} placeholder="Masukkan barcode..." className="w-full pl-10 pr-4 py-3 border rounded-lg" />
            </div>
          </div>
          <button onClick={startScanner} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-3 rounded-lg hover:bg-slate-200 border">
            <Camera size={20} /><span>Scan Kamera</span>
          </button>
          <button onClick={() => router.push(`/products/add?barcode=${barcodeInput}`)} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50" disabled={!barcodeInput}>
            <Plus size={18} /> Cari/Tambah
          </button>
        </div>
      </div>

      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
            <button onClick={stopScanner} className="absolute top-4 right-4 text-slate-500">✕</button>
            <h2 className="text-xl font-bold mb-6 text-center">Scan Barcode</h2>
            <div id="reader" className="mx-auto mb-6" />
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-10 text-slate-500">Memuat data...</div> : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Foto</th>
                <th className="p-4 font-semibold text-slate-600">Barcode</th>
                <th className="p-4 font-semibold text-slate-600">Nama</th>
                <th className="p-4 font-semibold text-slate-600 text-right">Harga</th>
                <th className="p-4 font-semibold text-slate-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="p-3">
                    {p.image ? <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg" /> : <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">No Pic</div>}
                  </td>
                  <td className="p-4 font-mono text-sm text-slate-600">{p.barcode}</td>
                  <td className="p-4 font-medium text-slate-800">{p.name}</td>
                  <td className="p-4 text-right text-slate-800">Rp{p.price.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => router.push(`/products/${p.id}/edit`)} className="text-blue-600 mr-4 font-medium">Edit</button>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-600 font-medium">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
