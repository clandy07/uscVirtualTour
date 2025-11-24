'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Buildings', href: '/admin/buildings', icon: '🏢' },
  { name: 'Locations', href: '/admin/locations', icon: '📍' },
  { name: 'Events', href: '/admin/events', icon: '📅' },
  { name: 'Organizations', href: '/admin/organizations', icon: '👥' },
  { name: 'Users', href: '/admin/users', icon: '👤' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-900 hover:text-green-700 focus:outline-none"
              >
                <span className="text-2xl">{sidebarOpen ? '☰' : '☰'}</span>
              </button>
              <h1 className="ml-4 text-xl font-bold text-gray-900">
                USC Virtual Tour Admin Panel
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-900 hover:text-green-700 text-sm flex items-center gap-2"
              >
                <span>←</span>
                <span>Back to Map</span>
              </Link>
              <button className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}
        >
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
