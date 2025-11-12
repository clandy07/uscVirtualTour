'use client';

import { useState } from 'react';
import { CategoryFilter } from '@/app/types';

interface SidebarProps {
  onFilterChange: (filters: CategoryFilter) => void;
}

export default function Sidebar({ onFilterChange }: SidebarProps) {
  const [filters, setFilters] = useState<CategoryFilter>({
    academic: true,
    events: false,
    food: true,
    facilities: false,
    transport: false,
    study: true,
    dorms: false,
    sports: true,
  });

  const items = [
    { id: 'academic' as keyof CategoryFilter, label: 'Academic Buildings', icon: '🏫' },
    { id: 'events' as keyof CategoryFilter, label: 'Events', icon: '📅' },
    { id: 'food' as keyof CategoryFilter, label: 'Food', icon: '🍽️' },
    { id: 'facilities' as keyof CategoryFilter, label: 'Facilities', icon: '🏛️' },
    { id: 'transport' as keyof CategoryFilter, label: 'Transport/Parking', icon: '🚗' },
    { id: 'study' as keyof CategoryFilter, label: 'Study Areas', icon: '📚' },
    { id: 'dorms' as keyof CategoryFilter, label: 'Dorms/Residences', icon: '🏠' },
    { id: 'sports' as keyof CategoryFilter, label: 'Sports/Recreation', icon: '⚽' },
  ];

  const toggleFilter = (id: keyof CategoryFilter) => {
    const newFilters = { ...filters, [id]: !filters[id] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <aside className="absolute left-4 top-4 bg-white rounded-lg shadow-lg p-4 w-64 z-20 max-h-[calc(100vh-120px)] overflow-y-auto">
      <h2 className="font-bold text-lg mb-3 text-gray-800">Map Layers</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={filters[item.id]}
              onChange={() => toggleFilter(item.id)}
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