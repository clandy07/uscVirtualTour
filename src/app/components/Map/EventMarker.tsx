'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { Event, Location } from '@/types';
import { EventIcon } from './CustomMarkers';

interface EventMarkerProps {
  event: Event;
  location: Location;
  onClick?: (event: Event, location: Location) => void;
  isHighlighted?: boolean;
  positionOverride?: google.maps.LatLngLiteral;
}

export default function EventMarker({ event, location, onClick, isHighlighted = false, positionOverride }: EventMarkerProps) {
  const getEventStatus = () => {
    const now = new Date();
    const startDate = new Date(event.date_time_start);
    const endDate = new Date(event.date_time_end);

    return {
      isOngoing: now >= startDate && now <= endDate,
      isUpcoming: now < startDate,
    };
  };

  const { isOngoing, isUpcoming } = getEventStatus();

  return (
    <AdvancedMarker
      position={positionOverride || location.coordinates}
      onClick={() => onClick?.(event, location)}
    >
      <div className={`relative group cursor-pointer transform hover:scale-110 transition-all ${
        isHighlighted ? 'scale-125 ring-4 ring-yellow-400 rounded-full animate-pulse' : ''
      }`}>
        <EventIcon isOngoing={isOngoing} isUpcoming={isUpcoming} />
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
          <div className="font-semibold">{event.theme || event.name}</div>
          <div className="text-xs mt-1">
            {isOngoing ? '🟢 Ongoing' : isUpcoming ? '🔵 Upcoming' : '⚪ Past'}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </AdvancedMarker>
  );
}