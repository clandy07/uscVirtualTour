'use client';

import { useState } from 'react';
import { Event, Organization } from '@/types';

interface EventsPanelProps {
  events?: Event[];
  organizations?: Organization[];
  onEventClick?: (eventId: number) => void;
}

export default function EventsPanel({ events = [], organizations = [], onEventClick }: EventsPanelProps) {
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
        return (
          <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full whitespace-nowrap flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Live
          </span>
        );
      case 'upcoming':
        return (
          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full whitespace-nowrap flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Upcoming
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-400 text-white text-xs font-semibold rounded-full whitespace-nowrap flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Past
          </span>
        );
    }
  };

  return (
    <aside className={`absolute right-2 sm:right-4 top-16 sm:top-20 bg-white rounded-lg shadow-lg w-64 sm:w-80 z-10 overflow-hidden transition-all duration-300 ${
      isExpanded ? 'max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)]' : 'max-h-12 sm:max-h-[3.75rem]'
    }`}>
      <div 
        className={`p-2 sm:p-4 cursor-pointer flex justify-between items-center bg-gray-200 hover:bg-gray-300 transition-colors flex-shrink-0 ${
          isExpanded ? 'rounded-t-lg' : 'rounded-lg'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="font-bold text-sm sm:text-lg text-gray-800">Campus Events</h2>
        <button className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </button>
      </div>
      
      {isExpanded && (
        <div className="overflow-y-auto overflow-x-hidden h-[calc(100%-3rem)] sm:h-[calc(100%-4rem)]">
          <div className="p-4 space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No events to display</p>
          ) : (
            events.map((event, index) => {
              const status = getEventStatus(event.date_time_start, event.date_time_end || event.date_time_start);
              return (
                <div
                  key={event.id}
                  onClick={() => event.id && onEventClick?.(event.id)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md cursor-pointer transition-all hover:scale-102 bg-white animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-semibold text-sm text-gray-900 flex-1">{event.name}</h3>
                    <div className="flex-shrink-0">
                      {getStatusBadge(status)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(event.date_time_start).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{new Date(event.date_time_start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                    {event.org_id && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{organizations.find(org => org.id === event.org_id)?.name || 'No Organization'}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      )}
    </aside>
  );
}