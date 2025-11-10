'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useMapControls } from '@/app/hooks/useMapControls';
import MapControls from './MapControls';
import LocationButton from './LocationButton';

export default function MapController() {
  const { map, zoomIn, zoomOut, centerOnLocation } = useMapControls();
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);

  const handleLocationFound = (position: { lat: number; lng: number }) => {
    if (!map) return;

    centerOnLocation(position);
    setUserPosition(position);

    // Add accuracy circle
    new google.maps.Circle({
      strokeColor: '#4285F4',
      strokeOpacity: 0.3,
      strokeWeight: 1,
      fillColor: '#4285F4',
      fillOpacity: 0.1,
      map: map,
      center: position,
      radius: 50,
    });
  };

  if (typeof window === 'undefined') return null;

  return (
    <>
      {userPosition && (
        <AdvancedMarker position={userPosition}>
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
        </AdvancedMarker>
      )}
      {createPortal(
        <>
          <MapControls onZoomIn={zoomIn} onZoomOut={zoomOut} />
          <LocationButton onLocationFound={handleLocationFound} />
        </>,
        document.body
      )}
    </>
  );
}