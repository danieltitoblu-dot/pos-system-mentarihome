import { ShoppingCart, Package, LayoutDashboard, Database } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Kasir", path: "/kasir", icon: ShoppingCart },
    { name: "Master Item", path: "/products", icon: Package },
    { name: "Manajemen Stok", path: "/stock", icon: Database },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 min-h-screen p-4">
      <div className="flex items-center gap-2 px-4 py-6 text-white font-bold text-xl">
        <div className="bg-blue-600 p-2 rounded-lg"><LayoutDashboard size={20} /></div>
        TailPOS
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition"
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
