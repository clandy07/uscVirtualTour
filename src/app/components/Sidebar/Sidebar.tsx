'use client';

import { useState } from 'react';
import { CategoryFilter } from '@/app/types';
import Image from 'next/image';

import BuildingIcon from '../../../../public/building.svg';
import EventIcon from '../../../../public/event.svg';
import FoodIcon from '../../../../public/food.svg';
import FacilityIcon from '../../../../public/facility.svg';
import TransportIcon from '../../../../public/parking.svg';
import StudyIcon from '../../../../public/study.svg';
import DormIcon from '../../../../public/dorm.svg';
import SportIcon from '../../../../public/sport.svg';

interface SidebarProps {
  onFilterChange: (filters: CategoryFilter) => void;
}

export default function Sidebar({ onFilterChange }: SidebarProps) {
  const [filters, setFilters] = useState<CategoryFilter>({
    building: true,
    events: false,
    food: true,
    facilities: false,
    transport: false,
    study: true,
    dorms: false,
    sports: true,
  });

  const items = [
    { id: 'building' as keyof CategoryFilter, label: 'Academic Buildings', icon: BuildingIcon },
    { id: 'events' as keyof CategoryFilter, label: 'Events', icon: EventIcon },
    { id: 'food' as keyof CategoryFilter, label: 'Food', icon: FoodIcon },
    { id: 'facilities' as keyof CategoryFilter, label: 'Facilities', icon: FacilityIcon },
    { id: 'transport' as keyof CategoryFilter, label: 'Transport/Parking', icon: TransportIcon },
    { id: 'study' as keyof CategoryFilter, label: 'Study Areas', icon: StudyIcon },
    { id: 'dorms' as keyof CategoryFilter, label: 'Dorms/Residences', icon: DormIcon },
    { id: 'sports' as keyof CategoryFilter, label: 'Sports/Recreation', icon: SportIcon },
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
            <Image 
              src={item.icon} 
              alt={item.label}
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="text-sm text-gray-700">{item.label}</span>
          </label>
        ))}
      </div>
    </aside>
  );
}