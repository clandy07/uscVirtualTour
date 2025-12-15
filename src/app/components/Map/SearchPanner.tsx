'use client';

import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface SearchPannerProps {
  searchResult: { coordinates: { lat: number; lng: number } } | null;
}

export default function SearchPanner({ searchResult }: SearchPannerProps) {
  const map = useMap();

  useEffect(() => {
    if (map && searchResult) {
      map.panTo(searchResult.coordinates);
      map.setZoom(20);
    }
  }, [map, searchResult]);

  return null;
}
