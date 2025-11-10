'use client';

import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { MAP_CONFIG } from '@/app/lib/googleMaps';
import MapController from './MapController';

export default function GoogleMap() {
  return (
    <APIProvider apiKey={MAP_CONFIG.apiKey}>
      <Map
        defaultCenter={MAP_CONFIG.center}
        defaultZoom={MAP_CONFIG.zoom}
        mapId="1255c889f9110b35d6071258"
        className="w-full h-full"
        disableDefaultUI={true}
        gestureHandling="greedy"
      >
        <MapController />
      </Map>
    </APIProvider>
  );
}