'use client';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string | null;
  barcode: string;
}

export default function ProductCard({ product, onAdd }: { product: Product, onAdd: (p: Product) => void }) {
  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-all cursor-pointer flex flex-col items-center"
      onClick={() => onAdd(product)}
    >
      {product.image ? (
        <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-full mb-3" />
      ) : (
        <div className="w-24 h-24 bg-blue-50 rounded-full mb-3 flex items-center justify-center text-blue-500 font-bold">
          {product.name.charAt(0)}
        </div>
      )}
      <h3 className="font-semibold text-slate-800 text-center truncate w-full">{product.name}</h3>
      <p className="text-blue-600 font-bold mt-1">Rp{product.price.toLocaleString()}</p>
    </div>
  );
}
