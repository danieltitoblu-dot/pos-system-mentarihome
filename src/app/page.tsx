'use client';
import { useState, useEffect, useRef } from 'react';
import { Camera, ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface Product {
  id: number;
  barcode: string;
  name: string;
  price: number;
  stock: number;
  image?: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanningMessage, setScanningMessage] = useState('');
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  const fetchProducts = () => {
    fetch('/api/products').then(res => res.json()).then(setProducts).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const startScanner = async () => {
    setIsScannerOpen(true);
    setScanningMessage('Memindai barcode...');
    html5QrcodeRef.current = new Html5Qrcode('reader');
    try {
      await html5QrcodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setBarcodeInput(decodedText);
          handleBarcodeScan(decodedText);
          setIsScannerOpen(false);
          html5QrcodeRef.current?.stop().then(() => html5QrcodeRef.current?.clear());
        },
        () => {}
      );
    } catch {
      setScanningMessage('Gagal mengakses kamera');
      setIsScannerOpen(false);
    }
  };

  const stopScanner = () => {
    setIsScannerOpen(false);
    html5QrcodeRef.current?.stop().then(() => html5QrcodeRef.current?.clear());
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      if (product.stock <= 0) { alert('Stok habis'); return; }
      addToCart(product);
    } else {
      alert('Produk tidak ditemukan');
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) { alert('Stok tidak mencukupi'); return prev; }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, sellingPrice: product.price, costPrice: product.price }];
    });
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    if (newQty > cart[index].product.stock) { alert('Stok tidak mencukupi'); return; }
    setCart(prev => {
      const nc = [...prev];
      nc[index] = { ...nc[index], quantity: newQty };
      return nc;
    });
  };

  const updatePrice = (index: number, newPrice: number) => {
    setCart(prev => {
      const nc = [...prev];
      nc[index] = { ...nc[index], sellingPrice: newPrice };
      return nc;
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const getTotal = () => cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);

  const checkout = async () => {
    if (cart.length === 0) return;
    const items = cart.map(item => ({ productId: item.product.id, quantity: item.quantity, sellingPrice: item.sellingPrice }));
    try {
      const res = await fetch('/api/stock/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Gagal checkout'); return; }
      alert('Checkout berhasil!');
      setCart([]);
      fetchProducts();
    } catch {
      alert('Kesalahan saat checkout');
    }
  };
  return (
    <div className="flex flex-1 overflow-hidden h-screen bg-slate-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 bg-white border-b flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">Kasir (POS)</h1>
          <div className="flex gap-2">
            <input type="text" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleBarcodeScan(barcodeInput)} placeholder="Ketik barcode..." className="px-4 py-2 border rounded-lg text-sm w-64" />
            <button onClick={startScanner} className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg text-sm font-medium"><Camera size={18} /> Kamera</button>
            <button onClick={() => handleBarcodeScan(barcodeInput)} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50" disabled={!barcodeInput}>Cari</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? <div className="text-center py-10">Memuat...</div> : products.length === 0 ? <div className="text-center py-10">Tidak ada produk</div> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map(p => {
                const hasStock = p.stock > 0;
                return (
                  <div key={p.id} onClick={() => hasStock && addToCart(p)} className={`cursor-pointer bg-white rounded-xl border p-4 transition-all ${hasStock ? 'hover:border-blue-300 hover:shadow-md' : 'opacity-50 cursor-not-allowed'}`}>
                    <div className="h-32 flex items-center justify-center mb-3">
                      {p.image ? <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain rounded-lg" /> : <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center font-bold">{p.name.charAt(0).toUpperCase()}</div>}
                    </div>
                    <h3 className="font-medium text-sm line-clamp-1">{p.name}</h3>
                    <p className="text-blue-600 font-bold text-sm mt-1">Rp{p.price.toLocaleString()}</p>
                    <span className={`text-xs font-semibold ${hasStock ? 'text-green-600' : 'text-red-600'}`}>{hasStock ? 'Stok: ' + p.stock : 'Habis'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-96 bg-white border-l p-6 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Keranjang</h2>
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <ShoppingCart size={48} className="mb-2 opacity-50" /><p>Keranjang kosong</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3">
            {cart.map((item, index) => (
              <div key={index} className="bg-slate-50 p-3 rounded-lg border flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-sm truncate">{item.product.name}</h4>
                  <button onClick={() => removeFromCart(index)} className="text-red-500"><Trash2 size={16} /></button>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Bar: {item.product.barcode}</span>
                  <span className={item.sellingPrice >= item.costPrice ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>Rp{item.sellingPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(index, item.quantity - 1)} className="w-7 h-7 border rounded flex items-center justify-center">−</button>
                    <span className="font-medium w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(index, item.quantity + 1)} className="w-7 h-7 border rounded flex items-center justify-center">+</button>
                  </div>
                  <input type="number" value={item.sellingPrice} onChange={(e) => updatePrice(index, parseInt(e.target.value) || 0)} className="w-24 text-right border rounded px-2 py-1 text-xs" min={item.costPrice} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-base font-bold mb-4">
            <span>Total</span><span className="text-blue-600">Rp{getTotal().toLocaleString()}</span>
          </div>
          <button onClick={checkout} disabled={cart.length === 0} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <ChevronRight size={18} /> Checkout Sekarang
          </button>
        </div>
      </div>

      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
            <button onClick={stopScanner} className="absolute top-4 right-4 text-slate-500 text-xl">✕</button>
            <h2 className="text-xl font-bold mb-2 text-center">Scan Barcode</h2>
            <p className="text-sm text-slate-500 text-center mb-6">{scanningMessage}</p>
            <div id="reader" className="mx-auto mb-6" />
            <button onClick={stopScanner} className="w-full bg-slate-100 py-2.5 rounded-lg">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

