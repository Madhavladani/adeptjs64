'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FolderTree, List, Layers, Menu } from 'lucide-react';

export default function AdminNavigation() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Subcategories', href: '/admin/subcategories', icon: List },
    { name: 'Components', href: '/admin/components', icon: Layers },
    { name: 'Menu', href: '/admin/menu', icon: Menu },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white p-4">
      <div className="text-xl font-bold mb-8">Admin Panel</div>
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}