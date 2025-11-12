'use client';

import { useState } from 'react';
import { Event } from '@/app/types';
import { MOCK_EVENTS, MOCK_LOCATIONS } from '@/app/lib/mockData';

interface EventsPanelProps {
  onEventClick: (eventId: number) => void;
}

type EventFilter = 'all' | 'today' | 'week' | 'upcoming';

export default function EventsPanel({ onEventClick }: EventsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<EventFilter>('all');

  const getFilteredEvents = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return MOCK_EVENTS.filter(event => {
      const eventStart = new Date(event.date_time_start);
      const eventEnd = new Date(event.date_time_end);

      switch (activeFilter) {
        case 'today':
          return eventStart >= today && eventStart < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        case 'week':
          return eventStart >= now && eventStart <= weekFromNow;
        case 'upcoming':
          return eventStart > now;
        case 'all':
        default:
          return true;
      }
    }).sort((a, b) => new Date(a.date_time_start).getTime() - new Date(b.date_time_start).getTime());
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.date_time_start);
    const endDate = new Date(event.date_time_end);

    if (now >= startDate && now <= endDate) {
      return { label: 'Ongoing', color: 'bg-green-100 text-green-800' };
    } else if (now < startDate) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { label: 'Past', color: 'bg-gray-100 text-gray-600' };
    }
  };

  const getLocationName = (locationId: number) => {
    const location = MOCK_LOCATIONS.find(loc => loc.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div className="absolute right-4 top-4 bg-white rounded-lg shadow-lg p-4 w-80 z-20 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      <h2 className="font-bold text-lg mb-3 text-gray-800">Campus Events</h2>
      
      {/* Filter buttons */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            activeFilter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setActiveFilter('today')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            activeFilter === 'today' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setActiveFilter('week')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            activeFilter === 'week' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            activeFilter === 'upcoming' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Upcoming
        </button>
      </div>

      {/* Event list */}
      <div className="space-y-2 overflow-y-auto flex-1">
        {filteredEvents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No events found</p>
        ) : (
          filteredEvents.map(event => {
            const status = getEventStatus(event);
            return (
              <div
                key={event.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onEventClick(event.id)}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-sm text-gray-800 flex-1">{event.theme}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">
                  📍 {getLocationName(event.location_id)}
                </p>
                <p className="text-xs text-gray-500">
                  🕒 {formatDate(event.date_time_start)}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Event count */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
        </p>
      </div>
    </div>
  );
}