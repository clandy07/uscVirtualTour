'use client';

import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { Event, Location } from '@/types';

interface EventPannerProps {
  selectedEventId: number | null;
  events: Event[];
  locations: Location[];
}

export default function EventPanner({ selectedEventId, events, locations }: EventPannerProps) {
  const map = useMap();

  useEffect(() => {
    if (map && selectedEventId) {
      const event = events.find(e => e.id === selectedEventId);
      if (event) {
        const location = locations.find(l => l.id === event.location_id);
        if (location && location.coordinates) {
          map.panTo(location.coordinates);
          map.setZoom(20);
        }
      }
    }
  }, [map, selectedEventId, events, locations]);

  return null;
}
