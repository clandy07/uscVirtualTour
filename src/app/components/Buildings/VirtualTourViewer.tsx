'use client';

import { useEffect, useRef } from 'react';

interface VirtualTourViewerProps {
  panoId?: string; // Panorama ID from Google Street View
  latitude?: number; // Fallback: use coordinates
  longitude?: number;
  heading?: number; // Initial viewing direction (0-360)
  pitch?: number; // Initial pitch angle (-90 to 90)
  zoom?: number; // Initial zoom level (0-5)
  floorName: string;
}

export default function VirtualTourViewer({ 
  panoId, 
  latitude, 
  longitude, 
  heading = 0, 
  pitch = 0, 
  zoom = 1,
  floorName 
}: VirtualTourViewerProps) {
  const panoramaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panoramaRef.current) return;

    // Initialize Street View panorama
    const panorama = new google.maps.StreetViewPanorama(
      panoramaRef.current,
      {
        pano: panoId,
        position: panoId ? undefined : (latitude && longitude ? { lat: latitude, lng: longitude } : undefined),
        pov: {
          heading: heading,
          pitch: pitch,
        },
        zoom: zoom,
        addressControl: false,
        linksControl: true,
        panControl: true,
        enableCloseButton: false,
        fullscreenControl: true,
        motionTracking: true,
        motionTrackingControl: true,
      }
    );

    return () => {
      // Cleanup if needed
    };
  }, [panoId, latitude, longitude, heading, pitch, zoom]);

  return (
    <div className="w-full h-[700px] sm:h-[800px]">
      <div 
        ref={panoramaRef} 
        className="w-full h-full"
        title={`Virtual Tour of ${floorName}`}
      />
    </div>
  );
}
