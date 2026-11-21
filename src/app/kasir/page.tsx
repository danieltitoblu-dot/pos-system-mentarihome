'use client';
import { useState, useEffect, useRef } from 'react';
import { Camera, ShoppingCart, Trash2, ChevronRight, Barcode } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface Product {
  id: number;
  barcode: string;
  name: string;
  price: number;
  stock: number;
  image?: string | null;
  costPrice?: number;
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
    fetch('/api/products').then(res => res.json()).then(data => {
      setProducts(data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchProducts(); }, []);

  const startScanner = async () => {
    setIsScannerOpen(true);
    setScanningMessage('Memindai barcode...');
    setTimeout(async () => {
      const readerEl = document.getElementById('reader');
      if (!readerEl) {
        setScanningMessage('Elemen scanner tidak ditemukan');
        setIsScannerOpen(false);
        return;
      }
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
    }, 300);
  };

  const stopScanner = () => {
    setIsScannerOpen(false);
    html5QrcodeRef.current?.stop().then(() => html5QrcodeRef.current?.clear());
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      if (product.stock <= 0) {
        alert('Stok produk ini habis, tidak dapat ditambahkan');
        return;
      }
      addToCart(product);
      setBarcodeInput('');
    } else {
      alert('Produk dengan barcode ' + barcode + ' tidak ditemukan');
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Stok habis');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      const minCost = product.costPrice || product.price;
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('Stok tidak mencukupi');
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, sellingPrice: Math.max(product.price, minCost), costPrice: minCost }];
    });
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const item = cart[index];
    if (newQty > item.product.stock) {
      alert('Stok tidak mencukupi');
      return;
    }
    setCart(prev => {
      const nc = [...prev];
      nc[index] = { ...nc[index], quantity: newQty };
      return nc;
    });
  };

  const updatePrice = (index: number, newPrice: number) => {
    const item = cart[index];
    const minCost = item.costPrice;
    if (newPrice < minCost) {
      alert(`Harga jual tidak boleh kurang dari harga beli/cost FIFO (Rp${minCost.toLocaleString()})`);
      return;
    }
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
    const items = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice,
    }));
    try {
      const res = await fetch('/api/stock/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal checkout');
        return;
      }
      alert('Checkout berhasil! Stok telah dikurangi menggunakan metode FIFO.');
      setCart([]);
      fetchProducts();
    } catch {
      alert('Kesalahan saat checkout');
    }
  };
  return (
    <div className="flex flex-1 overflow-hidden h-screen bg-slate-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 bg-white border-b flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">Kasir POS (FIFO & Barcode)</h1>
          <div className="flex gap-2">
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBarcodeScan(barcodeInput)}
                placeholder="Ketik/Scan barcode..."
                className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button onClick={startScanner} className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
              <Camera size={18} /> Kamera
            </button>
            <button onClick={() => handleBarcodeScan(barcodeInput)} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50" disabled={!barcodeInput}>
              Cari
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-10 text-slate-500">Memuat produk...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-slate-500">Tidak ada produk ditemukan</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map(p => {
                const hasStock = p.stock > 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => hasStock && addToCart(p)}
                    className={`bg-white rounded-xl border p-4 transition-all flex flex-col items-center ${
                      hasStock 
                        ? 'cursor-pointer border-slate-200 hover:border-blue-400 hover:shadow-md' 
                        : 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-300'
                    }`}
                  >
                    <div className="h-28 w-full flex items-center justify-center mb-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain rounded-lg" />
                      ) : (
                        <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-500 text-lg">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm line-clamp-1 text-slate-800 text-center w-full">{p.name}</h3>
                    <p className="text-blue-600 font-bold text-sm mt-1">Rp{p.price.toLocaleString()}</p>
                    <span className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-full ${hasStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {hasStock ? `Stok: ${p.stock}` : 'Stok Habis'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white border-l p-6 flex flex-col shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Keranjang Belanja</h2>
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <ShoppingCart size={48} className="mb-2 opacity-50" />
            <p className="text-sm">Keranjang masih kosong</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3">
            {cart.map((item, index) => (
              <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-sm truncate text-slate-800">{item.product.name}</h4>
                  <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Bar: {item.product.barcode}</span>
                  <span className="text-slate-600">Min Cost: Rp{item.costPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(index, item.quantity - 1)} className="w-7 h-7 border border-slate-300 rounded flex items-center justify-center hover:bg-slate-200">ΓêÆ</button>
                    <span className="font-medium w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(index, item.quantity + 1)} className="w-7 h-7 border border-slate-300 rounded flex items-center justify-center hover:bg-slate-200">+</button>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-400">Harga Jual (Min Rp{item.costPrice})</span>
                    <input
                      type="number"
                      value={item.sellingPrice}
                      onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                      className="w-28 text-right border border-slate-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-blue-600"
                      min={item.costPrice}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex justify-between text-base font-bold mb-4">
            <span className="text-slate-700">Total</span>
            <span className="text-blue-600">Rp{getTotal().toLocaleString()}</span>
          </div>
          <button
            onClick={checkout}
            disabled={cart.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-green-100"
          >
            <ChevronRight size={18} /> Checkout Sekarang (FIFO)
          </button>
        </div>
      </div>

      {/* Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative shadow-2xl">
            <button onClick={stopScanner} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 text-xl font-bold">Γ£ò</button>
            <h2 className="text-xl font-bold mb-2 text-center text-slate-800">Scan Barcode Produk</h2>
            <p className="text-sm text-slate-500 text-center mb-6">{scanningMessage}</p>
            <div id="reader" className="mx-auto mb-6 rounded-lg overflow-hidden" />
            <button onClick={stopScanner} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-medium transition">
              Tutup Kamera
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

