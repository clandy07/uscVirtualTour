import { MapConfig } from '@/app/types';

// USC Talamban Campus coordinates (approximate center)
export const USC_TALAMBAN_CENTER = {
  lat: 10.3530,
  lng: 123.9122,
};

export const MAP_CONFIG: MapConfig = {
  center: USC_TALAMBAN_CENTER,
  zoom: 17,
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
};

export const MAP_STYLES = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];