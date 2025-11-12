'use client';

import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Event, Location } from '@/app/types';

interface EventMarkerProps {
  event: Event;
  location: Location;
  onClick?: (event: Event, location: Location) => void;
}

export default function EventMarker({ event, location, onClick }: EventMarkerProps) {
  const getEventColor = () => {
    // Check if event is ongoing, upcoming, or past
    const now = new Date();
    const startDate = new Date(event.date_time_start);
    const endDate = new Date(event.date_time_end);

    if (now >= startDate && now <= endDate) {
      return '#10b981'; // green - ongoing
    } else if (now < startDate) {
      return '#3b82f6'; // blue - upcoming
    } else {
      return '#9ca3af'; // gray - past
    }
  };

  return (
    <AdvancedMarker
      position={location.coordinates}
      onClick={() => onClick?.(event, location)}
    >
      <div className="relative">
        <Pin
          background={getEventColor()}
          borderColor="#fff"
          glyphColor="#fff"
        />
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md whitespace-nowrap text-xs font-medium">
          📅 Event
        </div>
      </div>
    </AdvancedMarker>
  );
}