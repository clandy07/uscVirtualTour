'use client';

import { Event } from '@/types';

interface EventInfoCardProps {
  event: Event & {
    coordinates?: { lat: number; lng: number };
    locationName?: string;
    orgName?: string;
  };
  onClose: () => void;
  onGetDirections: (coordinates: { lat: number; lng: number }, name: string) => void;
}

export default function EventInfoCard({ event, onClose, onGetDirections }: EventInfoCardProps) {
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
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">🟢 Live</span>;
      case 'upcoming':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">🔵 Upcoming</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">⚪ Past</span>;
    }
  };

  const handleGetDirections = () => {
    if (event.coordinates) {
      onGetDirections(event.coordinates, event.name);
    }
  };

  const status = getEventStatus(event.date_time_start, event.date_time_end || event.date_time_start);
  const startDate = new Date(event.date_time_start);
  const endDate = event.date_time_end ? new Date(event.date_time_end) : null;

  return (
    <div className="bg-white rounded-lg shadow-2xl w-56 sm:w-96 overflow-hidden border border-gray-200 flex flex-col max-h-[calc(100vh-10rem)]">
      {/* Header with event theme color */}
      <div className="bg-purple-700 text-white px-2 sm:px-4 py-1.5 sm:py-3 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="text-xs sm:text-lg font-bold">{event.name}</h3>
              <p className="text-[10px] sm:text-xs opacity-90 mt-0.5 sm:mt-1">Event{event.theme && ` • ${event.theme}`}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl sm:text-2xl font-light leading-none transition-transform hover:rotate-90"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-4 space-y-2 sm:space-y-3 overflow-y-auto flex-1">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {getStatusBadge(status)}
          </div>

          {/* Description */}
          {event.description && (
            <div className="text-[11px] sm:text-sm">
              <p className="font-semibold text-gray-900 mb-0.5 sm:mb-1">About</p>
              <p className="text-gray-700">{event.description}</p>
            </div>
          )}

          {/* Date and Time */}
          <div className="text-sm space-y-2">
            <p className="font-semibold text-gray-900">Schedule</p>
            <div className="space-y-1">
              <p className="text-gray-700">
                📅 {startDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-gray-700">
                🕐 {startDate.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
                {endDate && ` - ${endDate.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}`}
              </p>
            </div>
          </div>

          {/* Organization */}
          {event.orgName && (
            <div className="text-sm">
              <p className="font-semibold text-gray-900 mb-1">Organized by</p>
              <p className="text-gray-700">🏢 {event.orgName}</p>
            </div>
          )}

          {/* Location */}
          {event.locationName && (
            <div className="text-sm">
              <p className="font-semibold text-gray-900 mb-1">Location</p>
              <p className="text-gray-700">📍 {event.locationName}</p>
            </div>
          )}

          {/* Visibility */}
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-1">Visibility</p>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
              {event.visibility === 'everyone' ? '🌐 Public' : 
               event.visibility === 'only_students' ? '🎓 Students Only' : 
               '👥 Members Only'}
            </span>
          </div>

          {/* Get Directions Button */}
          <div className="pt-2">
            {event.coordinates && (
              <button
                onClick={handleGetDirections}
                className="w-full px-3 sm:px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 font-bold transition-all hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span>Get Directions</span>
              </button>
            )}
          </div>
        </div>
      </div>
  );
}
