'use client';
import { useState, useEffect, useRef } from 'react';
import { Barcode, Camera, ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import Html5Qrcode from 'html5-qrcode';

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanningMessage, setScanningMessage] = useState('');
  const html5QrcodeRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .finally(() => setLoading(false));
  };

  const startScanner = async () => {
    setIsScannerOpen(true);
    setScanningMessage('Memindai barcode...');
    html5QrcodeRef.current = new Html5Qrcode('reader');
    try {
      await html5QrcodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        function(decodedText) {
          setBarcodeInput(decodedText);
          handleBarcodeScan(decodedText);
          setIsScannerOpen(false);
          html5QrcodeRef.current?.stop().then(function() {
            html5QrcodeRef.current?.clear();
          });
        },
        function(errorMessage) {}
      );
    } catch (err) {
      setScanningMessage('Gagal mengakses kamera');
      setIsScannerOpen(false);
    }
  };

  const stopScanner = function() {
    setIsScannerOpen(false);
    html5QrcodeRef.current?.stop().then(function() {
      html5QrcodeRef.current?.clear();
    });
  };

  const handleBarcodeScan = function(barcode) {
    const product = products.find(function(p) {
      return p.barcode === barcode;
    });
    if (product) {
      if (product.stock <= 0) {
        alert('Stok habis, tidak dapat ditambahkan ke keranjang');
        return;
      }
      addToCart(product);
    } else {
      alert('Produk dengan barcode ' + barcode + ' tidak ditemukan');
    }
  };

  const addToCart = function(product) {
    setCart(function(prev) {
      const existing = prev.find(function(item) {
        return item.product.id === product.id;
      });
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('Stok tidak mencukupi');
          return prev;
        }
        return prev.map(function(item) {
          if (item.product.id === product.id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      }
      return [...prev, ({ product, quantity: 1, sellingPrice: product.price, costPrice: product.price })];
    });
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const product = cart[index].product;
    if (newQty > product.stock) {
      alert('Stok tidak mencukupi');
      return;
    }
    setCart(prev => {
      const newCart = [...prev];
      newCart[index] = { ...newCart[index], quantity: newQty };
      return newCart;
    });
  };

  const updatePrice = function(index, newPrice) {
    setCart(function(prev) {
      const newCart = [...prev];
      newCart[index] = { ...newCart[index], sellingPrice: newPrice };
      return newCart;
    });
  };

  const removeFromCart = function(index) {
    setCart(function(prev) {
      return prev.filter(function(_, i) {
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Daftar Produk</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBarcodeScan(barcodeInput)}
                placeholder="Ketik barcode..."
                className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
              <button
                onClick={startScanner}
                className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition text-slate-700 font-medium text-sm"
              >
                <Camera size={18} />
                Kamera
              </button>
              <button
                onClick={() => handleBarcodeScan(barcodeInput)}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
                disabled={!barcodeInput}
              >
                Cari
              </button>
            </div>
          </div>
          {loading && (
            <div className="text-center py-10 text-slate-500">Memuat data...</div>
          )}
          {!loading && products.length === 0 && (
            <div className="text-center py-10 text-slate-500">Tidak ada produk</div>
          )}
          {!loading && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map(function(p) {
                const hasStock = p.stock > 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => hasStock && addToCart(p)}
                    className={"group cursor-pointer bg-white rounded-xl border p-4 transition-all " + (hasStock ? "border-slate-200 hover:border-blue-300 hover:shadow-md" : "border-slate-200 opacity-50 cursor-not-allowed")}
                  >
                    <div className="h-32 flex items-center justify-center mb-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
        <div className="w-96 bg-white border-l border-slate-200 p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Keranjang</h2>
          {cart.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart size={48} className="mb-2 opacity-50" />
              <p>Keranjang kosong</p>
            </div>
          )}
          {cart.length > 0 && (
            <div className="flex-1 overflow-y-auto space-y-3">
              {cart.map(function(item, index) {
                return (
                  <div key={index} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col md:flex-row gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-slate-800 text-sm truncate">{item.product.name}</h4>
                        <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">Barcode: {item.product.barcode}</span>
                        <span className={"text-xs font-bold " + (item.sellingPrice >= item.costPrice ? "text-green-600" : "text-red-600")}>
                          Rp{item.sellingPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-end gap-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQuantity(index, item.quantity - 1)} className="w-8 h-8 border border-slate-300 rounded flex items-center justify-center hover:bg-slate-100 text-sm">
                          −
                        </button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(index, item.quantity + 1)} className="w-8 h-8 border border-slate-300 rounded flex items-center justify-center hover:bg-slate-100 text-sm">
                          +
                        </button>
                      </div>
                      <input
                        type="number"
                        value={item.sellingPrice}
                        onChange={(e) => updatePrice(index, parseInt(e.target.value) || 0)}
                        className="w-24 text-right border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        min={item.costPrice}
                      />
                      <span className="font-bold text-sm text-slate-800">
                        Rp{item.sellingPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span className="text-slate-700">Total</span>
              <span className="text-blue-600">Rp{getTotal().toLocaleString()}</span>
            </div>
            <button
              onClick={checkout}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative">
            <button onClick={stopScanner} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 text-xl">✕</button>
            <h2 className="text-xl font-bold mb-2 text-center">Scan Barcode</h2>
            <p className="text-sm text-slate-500 text-center mb-6">{scanningMessage}</p>
            <div id="reader" className="mx-auto mb-6" />
            <button onClick={stopScanner} className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-lg hover:bg-slate-200">
              Tutup Kamera
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
              disabled={cart.length === 0}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} /> Checkout Sekarang
            </button>
          </div>
        </div>
      </div>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3 className={"font-medium " + (hasStock ? "text-slate-800" : "text-slate-400")} className="line-clamp-1">{p.name}</h3>
                    <p className="text-blue-600 font-bold text-sm mt-1">Rp{p.price.toLocaleString()}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className={"font-semibold " + (hasStock ? "text-green-600" : "text-red-600")}>
                        {hasStock ? "Stok: " + p.stock : "Stok Habis"}
                      </span>
                      {!hasStock && <span className="text-slate-400">Tidak bisa pilih</span>}
                    </div>
                    {!hasStock && (
                      <div className="mt-2 w-full bg-red-50 text-red-600 text-xs py-1.5 rounded text-center">
                        Stok kosong - tidak bisa ditambahkan
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        return i !== index;
      });
    });
  };

  const getTotal = function() {
    return cart.reduce(function(sum, item) {
      return sum + item.sellingPrice * item.quantity;
    }, 0);
  };

  const checkout = async function() {
    if (cart.length === 0) return;
    const items = cart.map(function(item) {
      return {
        productId: item.product.id,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
      };
    });
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
      alert('Checkout berhasil!');
      setCart([]);
      fetchProducts();
    } catch (err) {
      alert('Terjadi kesalahan saat checkout');
    }
  };
