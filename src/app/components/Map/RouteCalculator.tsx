'use client';

import { useEffect, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface RouteCalculatorProps {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  onRouteCalculated?: (route: google.maps.DirectionsResult) => void;
  onClearRoute?: () => void;
}

export default function RouteCalculator({ 
  origin, 
  destination, 
  onRouteCalculated,
  onClearRoute 
}: RouteCalculatorProps) {
  const map = useMap();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create directions renderer
    const renderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#15803d', // green-700
        strokeWeight: 5,
        strokeOpacity: 0.8,
      },
    });
    setDirectionsRenderer(renderer);

    return () => {
      renderer.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (!directionsRenderer || !map) return;

    // Clear route if origin or destination is null
    if (!origin || !destination) {
      // Properly clear by setting the map to null, which removes everything
      directionsRenderer.setMap(null);
      return;
    }

    // Re-attach to map before setting new directions
    directionsRenderer.setMap(map);

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
          onRouteCalculated?.(result);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  }, [directionsRenderer, origin, destination, map, onRouteCalculated]);

  return null;
}
