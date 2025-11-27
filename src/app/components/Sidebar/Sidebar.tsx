'use client';

import { useState } from 'react';
import { CategoryFilter } from '@/types';
import Image from 'next/image';

import { buildingIcon, eventsIcon, foodIcon, facilitiesIcon, transportIcon, studyIcon, dormsIcon, sportsIcon }  from "../../lib/icons";

interface SidebarProps {
  onFilterChange: (filters: CategoryFilter) => void;
}

export default function Sidebar({ onFilterChange }: SidebarProps) {
  const [filters, setFilters] = useState<CategoryFilter>({
    buildings: true,
    events: false,
    food: true,
    facilities: false,
    transport_parking: false,
    study_areas: true,
    dorms_residences: false,
    sports_recreation: true,
  });

  const [isExpanded, setIsExpanded] = useState(true);

  const items = [
    { id: 'buildings' as keyof CategoryFilter, label: 'Academic Buildings', icon: buildingIcon },
    { id: 'events' as keyof CategoryFilter, label: 'Events', icon: eventsIcon },
    { id: 'food' as keyof CategoryFilter, label: 'Food', icon: foodIcon },
    { id: 'facilities' as keyof CategoryFilter, label: 'Facilities', icon: facilitiesIcon },
    { id: 'transport_parking' as keyof CategoryFilter, label: 'Transport/Parking', icon: transportIcon },
    { id: 'study_areas' as keyof CategoryFilter, label: 'Study Areas', icon: studyIcon },
    { id: 'dorms_residences' as keyof CategoryFilter, label: 'Dorms/Residences', icon: dormsIcon },
    { id: 'sports_recreation' as keyof CategoryFilter, label: 'Sports/Recreation', icon: sportsIcon },
  ];

  const toggleFilter = (id: keyof CategoryFilter) => {
    const newFilters = { ...filters, [id]: !filters[id] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <aside className={`absolute left-4 top-25 bg-white rounded-lg shadow-lg w-64 z-20 transition-all duration-300 ${
      isExpanded ? 'max-h-[calc(100vh-120px)]' : 'max-h-14'
    }`}>
      <div 
        className="p-4 cursor-pointer flex justify-between items-center bg-gray-200 hover:bg-gray-300 transition-colors rounded-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="font-bold text-lg text-gray-800">Map Layers</h2>
        <button className="text-gray-500 hover:text-gray-700 text-xl transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </button>
      </div>
      
      <div className={`overflow-y-auto transition-all duration-300 ${
        isExpanded ? 'max-h-[calc(100vh-180px)] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-4 space-y-2">
          {items.map((item, index) => (
            <label
              key={item.id}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-all hover:scale-102 animate-fadeIn"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <input
                type="checkbox"
                checked={filters[item.id]}
                onChange={() => toggleFilter(item.id)}
                className="w-4 h-4 accent-green-700 transition-transform checked:scale-110"
              />
              <Image 
                src={item.icon} 
                alt={item.label}
                width={24}
                height={24}
                className="w-6 h-6 transition-transform group-hover:scale-110"
              />
              <span className="text-sm text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}