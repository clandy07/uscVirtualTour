'use client';

import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Location } from '@/app/types';

interface LocationMarkerProps {
  location: Location;
  onClick?: (location: Location) => void;
}

export default function LocationMarker({ location, onClick }: LocationMarkerProps) {
  const getMarkerColor = (category: string) => {
    const colors = {
      academic: '#1e40af',    // blue
      food: '#ea580c',        // orange
      sports: '#16a34a',      // green
      facilities: '#7c3aed',  // purple
      transport: '#6b7280',   // gray
      study: '#0891b2',       // cyan
      dorms: '#dc2626',       // red
      events: '#f59e0b',     // amber
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  return (
    <AdvancedMarker
      position={location.coordinates}
      onClick={() => onClick?.(location)}
    >
      <Pin
        background={getMarkerColor(location.category)}
        borderColor="#fff"
        glyphColor="#fff"
      />
    </AdvancedMarker>
  );
}