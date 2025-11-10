'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  checked: boolean;
}

export default function Sidebar() {
  const [items, setItems] = useState<SidebarItem[]>([
    { id: 'buildings', label: 'Buildings', icon: '🏢', checked: false },
    { id: 'events', label: 'Events', icon: '📅', checked: false },
    { id: 'food', label: 'Food', icon: '🍽️', checked: false },
    { id: 'facilities', label: 'Facilities', icon: '🏛️', checked: false },
    { id: 'transport', label: 'Transport/Parking', icon: '🚗', checked: false },
    { id: 'study', label: 'Study Areas', icon: '📚', checked: false },
    { id: 'dorms', label: 'Dorms/Residences', icon: '🏠', checked: false },
    { id: 'sports', label: 'Sports/Recreation', icon: '⚽', checked: false },
  ]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  return (
    <aside className="absolute left-4 top-20 bg-white rounded-lg shadow-lg p-4 w-64 z-20">
      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(item.id)}
              className="w-4 h-4 accent-green-700"
            />
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm text-gray-700">{item.label}</span>
          </label>
        ))}
      </div>
    </aside>
  );
}