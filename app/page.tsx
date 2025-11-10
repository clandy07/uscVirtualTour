'use client';

import GoogleMap from './components/Map/GoogleMap';
import Sidebar from './components/Sidebar/Sidebar';
import Image from 'next/image';

import usc_logo from '../public/usc-logo.webp';
import settings from '../public/settings.svg';

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="bg-foreground text-background p-4 shadow-md z-10 flex items-center gap-4 justify-between">
        <Image src={usc_logo} alt='USC Logo' className='w-15 h-15 cursor-pointer'/>
        <input
          type="text"
          placeholder="Search building/events..."
          className="p-2 rounded-md w-1/3 text-black bg-gray-300 placeholder:text-gray-600"
        />
        <Image src={settings} alt='Settings Icon' className='w-8 h-8 cursor-pointer'/>
      </header>
      <main className="flex-1 relative">
        <GoogleMap />
        <Sidebar />
      </main>
    </div>
  );
}