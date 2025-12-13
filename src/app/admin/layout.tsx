'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import Image from 'next/image';
import { dashboardIcon, campusIcon, buildingIcon, floorMapIcon, locationIcon, eventsIcon, organizationsIcon, userIcon } from '@/app/lib/icons';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: dashboardIcon },
  { name: 'Campuses', href: '/admin/campuses', icon: campusIcon },
  { name: 'Buildings', href: '/admin/buildings', icon: buildingIcon },
  { name: 'Floor Maps', href: '/admin/floor-maps', icon: floorMapIcon },
  { name: 'Locations', href: '/admin/locations', icon: locationIcon },
  { name: 'Events', href: '/admin/events', icon: eventsIcon },
  { name: 'Organizations', href: '/admin/organizations', icon: organizationsIcon },
  { name: 'Users', href: '/admin/users', icon: userIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await authClient.getSession();
        console.log('Admin check - session data:', data); // Debug log
        const user = data?.user || data;
        if (!user?.is_admin) {
          // Not an admin, redirect to home
          console.log('User is not admin, redirecting...');
          router.push('/');
          return;
        }
        setSession(data);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const user = session?.user || session;
  if (!user?.is_admin) {
    return null; // Will redirect in useEffect
  }

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
                className="text-green-700 hover:text-green-800 focus:outline-none font-bold"
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
                className="text-gray-900 hover:text-green-700 text-sm flex items-center gap-2 cursor-pointer"
              >
                <span>←</span>
                <span>Back to Map</span>
              </Link>
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
              >
                Sign out
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
                      ? 'bg-green-50 text-black font-bold'
                      : 'text-black hover:bg-green-50'
                  }`}
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
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
