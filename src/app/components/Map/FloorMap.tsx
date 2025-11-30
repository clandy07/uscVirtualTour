'use client';

import { GoogleMap, KmlLayer } from '@react-google-maps/api';
import { useState } from 'react';

interface FloorMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  kmlUrl?: string;
  embedUrl?: string; 
}

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
  tilt: 0
};

const iframeStyle = {
  width: '100%',
  height: '500px',
  border: 0,
};

export default function FloorMap({ center, zoom, kmlUrl, embedUrl }: FloorMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [kmlError, setKmlError] = useState<string | null>(null);

  // Debug logging
  console.log('FloorMap props:', { center, zoom, kmlUrl, embedUrl });

  // If embed URL is provided, use iframe (simpler and more reliable)
  if (embedUrl) {
    console.log('Using embed URL:', embedUrl);
    return (
      <div className="rounded-lg overflow-hidden">
        <p className="text-xs text-gray-500 mb-2 p-2">Embed URL: {embedUrl}</p>
        <iframe
          src={embedUrl}
          style={iframeStyle}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Floor Map"
        />
      </div>
    );
  }

  // Construct full URL if relative path is provided
  const fullKmlUrl = kmlUrl && !kmlUrl.startsWith('http') 
    ? `${window.location.origin}${kmlUrl}` 
    : kmlUrl;

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onLoad={setMap}
      >
        {/* Load KML layer from Google My Maps export */}
        {fullKmlUrl && (
          <KmlLayer
            url={fullKmlUrl}
            options={{
              preserveViewport: false,
              suppressInfoWindows: false,
            }}
            onLoad={() => {
              console.log('KML loaded successfully:', fullKmlUrl);
              setKmlError(null);
            }}
            onUnmount={() => console.log('KML unmounted')}
          />
        )}
      </GoogleMap>
      {kmlError && (
        <p className="text-red-600 text-sm mt-2">Error loading KML: {kmlError}</p>
      )}
      <p className="text-xs text-gray-500 mt-2">KML URL: {fullKmlUrl}</p>
    </div>
  );
}
