'use client';
import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface SpiderLinesProps {
  spiderfiedPositions: Map<string | number, google.maps.LatLngLiteral>;
  originalPositions: Map<string | number, google.maps.LatLngLiteral>;
}

/**
 * Renders connection lines from center to spiderfied markers
 */
export default function SpiderLines({ spiderfiedPositions, originalPositions }: SpiderLinesProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || spiderfiedPositions.size === 0) return;

    const polylines: google.maps.Polyline[] = [];

    // Draw lines from original position to spiderfied position
    spiderfiedPositions.forEach((spiderfiedPos, markerId) => {
      const originalPos = originalPositions.get(markerId);
      if (!originalPos) return;

      const line = new google.maps.Polyline({
        path: [originalPos, spiderfiedPos],
        geodesic: true,
        strokeColor: '#4F46E5',
        strokeOpacity: 0.6,
        strokeWeight: 2,
        map: map,
      });

      polylines.push(line);
    });

    // Cleanup lines when component unmounts or positions change
    return () => {
      polylines.forEach(line => line.setMap(null));
    };
  }, [map, spiderfiedPositions, originalPositions]);

  return null; // This component doesn't render any React elements
}
