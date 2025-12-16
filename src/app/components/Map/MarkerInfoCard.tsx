'use client';

import { useMap } from '@vis.gl/react-google-maps';
import { useEffect, useState, ReactNode } from 'react';

interface MarkerInfoCardProps {
  coordinates: { lat: number; lng: number };
  children: ReactNode;
}

export default function MarkerInfoCard({ coordinates, children }: MarkerInfoCardProps) {
  const map = useMap();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!map) return;

    const updatePosition = () => {
      const projection = map.getProjection();
      if (!projection) return;

      const bounds = map.getBounds();
      if (!bounds) return;

      // Convert lat/lng to screen coordinates
      const latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
      const scale = Math.pow(2, map.getZoom() || 0);
      const worldCoordinate = projection.fromLatLngToPoint(latLng);
      
      if (!worldCoordinate) return;

      const mapDiv = map.getDiv();
      const mapWidth = mapDiv.offsetWidth;
      const mapHeight = mapDiv.offsetHeight;

      // Get the map's current bounds in world coordinates
      const neBound = bounds.getNorthEast();
      const swBound = bounds.getSouthWest();
      const neWorldCoord = projection.fromLatLngToPoint(neBound);
      const swWorldCoord = projection.fromLatLngToPoint(swBound);

      if (!neWorldCoord || !swWorldCoord) return;

      // Calculate pixel position
      const x = ((worldCoordinate.x - swWorldCoord.x) / (neWorldCoord.x - swWorldCoord.x)) * mapWidth;
      const y = ((worldCoordinate.y - neWorldCoord.y) / (swWorldCoord.y - neWorldCoord.y)) * mapHeight;

      setPosition({ x, y });
    };

    updatePosition();

    // Update position on map changes
    const listeners = [
      google.maps.event.addListener(map, 'bounds_changed', updatePosition),
      google.maps.event.addListener(map, 'zoom_changed', updatePosition),
    ];

    return () => {
      listeners.forEach(listener => google.maps.event.removeListener(listener));
    };
  }, [map, coordinates.lat, coordinates.lng]);

  if (!position) return null;

  // Calculate if card should appear on left or right
  const mapDiv = map?.getDiv();
  const mapWidth = mapDiv?.offsetWidth || 0;
  const cardWidth = mapWidth < 640 ? 224 : 384; // w-56 (224px) on mobile, w-96 (384px) on desktop
  const padding = 16;
  
  // Position to the right of marker by default, unless too close to right edge
  const showOnLeft = position.x + cardWidth + padding > mapWidth;
  const leftPosition = showOnLeft 
    ? Math.max(padding, position.x - cardWidth - padding)
    : position.x + padding + 20; // 20px offset from marker

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: `${leftPosition}px`,
        top: `${Math.max(80, position.y - 100)}px`,
      }}
    >
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
