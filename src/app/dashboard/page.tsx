'use client';
import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Package, DollarSign } from 'lucide-react';

interface ProductSales {
  id: number;
  name: string;
  price: number;
  stock: number;
  soldQuantity: number;
  revenue: number;
}
interface DailySales {
  date: string;
  quantity: number;
  revenue: number;
}
interface DashboardData {
  bestSelling: ProductSales[];
  leastSelling: ProductSales[];
  salesReport: DailySales[];
  totalSales: { totalQuantity: number; totalRevenue: number; totalProductsSold: number };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="p-8 text-slate-500">Memuat dashboard...</div>;
  if (!data) return <div className="p-8 text-red-500">Gagal memuat data</div>;
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard Penjualan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg"><DollarSign className="text-green-600" size={24}/></div>
          <div><p className="text-sm text-slate-500">Total Revenue (30 hari)</p><p className="text-2xl font-bold">Rp{data.totalSales.totalRevenue.toLocaleString()}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><Package className="text-blue-600" size={24}/></div>
          <div><p className="text-sm text-slate-500">Total Kuantitas</p><p className="text-2xl font-bold">{data.totalSales.totalQuantity}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg"><BarChart3 className="text-purple-600" size={24}/></div>
          <div><p className="text-sm text-slate-500">Produk Terjual</p><p className="text-2xl font-bold">{data.totalSales.totalProductsSold}</p></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="text-green-600"/>25 Item Paling Laku</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr><th className="text-left p-3">Nama</th><th className="text-right p-3">Terjual</th><th className="text-right p-3">Revenue</th></tr></thead>
              <tbody>{data.bestSelling.map(p => (<tr key={p.id} className="border-t"><td className="p-3">{p.name}</td><td className="p-3 text-right">{p.soldQuantity}</td><td className="p-3 text-right">Rp{p.revenue.toLocaleString()}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingDown className="text-red-600"/>25 Item Tidak Laku</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr><th className="text-left p-3">Nama</th><th className="text-right p-3">Terjual</th><th className="text-right p-3">Stok</th></tr></thead>
              <tbody>{data.leastSelling.map(p => (<tr key={p.id} className="border-t"><td className="p-3">{p.name}</td><td className="p-3 text-right">{p.soldQuantity}</td><td className="p-3 text-right">{p.stock}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold mb-4">Laporan Penjualan Harian (30 Hari)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="text-left p-3">Tanggal</th><th className="text-right p-3">Kuantitas</th><th className="text-right p-3">Revenue</th></tr></thead>
            <tbody>{data.salesReport.map(r => (<tr key={r.date} className="border-t"><td className="p-3">{r.date}</td><td className="p-3 text-right">{r.quantity}</td><td className="p-3 text-right">Rp{r.revenue.toLocaleString()}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
