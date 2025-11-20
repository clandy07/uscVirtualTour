'use client';

import { useState } from 'react';
import { MOCK_EVENTS } from '@/app/lib/mockData';

interface EventsPanelProps {
  onEventClick?: (eventId: number) => void;
}

export default function EventsPanel({ onEventClick }: EventsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now >= start && now <= end) return 'ongoing';
    if (now < start) return 'upcoming';
    return 'past';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full whitespace-nowrap">🟢 Live</span>;
      case 'upcoming':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full whitespace-nowrap">🔵 Upcoming</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full whitespace-nowrap">⚪ Past</span>;
    }
  };

  return (
    <aside className={`absolute right-4 top-25 bg-white rounded-lg shadow-lg w-80 z-50 transition-all duration-300 ${
      isExpanded ? 'max-h-[calc(100vh-120px)]' : 'max-h-14'
    }`}>
      <div 
        className="p-4 cursor-pointer flex justify-between items-center bg-gray-200 hover:bg-gray-300 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="font-bold text-lg text-gray-800">Campus Events</h2>
        <button className="text-gray-500 hover:text-gray-700 text-xl transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </button>
      </div>
      
      <div className={`overflow-y-auto transition-all duration-300 ${
        isExpanded ? 'max-h-[calc(100vh-180px)] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-4 space-y-3">
          {MOCK_EVENTS.map((event, index) => {
            const status = getEventStatus(event.date_time_start, event.date_time_end);
            return (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event.id)}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md cursor-pointer transition-all hover:scale-102 bg-white animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-semibold text-sm text-gray-900 flex-1">{event.theme}</h3>
                  <div className="flex-shrink-0">
                    {getStatusBadge(status)}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-1">
                  📅 {new Date(event.date_time_start).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-600">
                  🕐 {new Date(event.date_time_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}