import { useMap } from '@vis.gl/react-google-maps';
import { useCallback } from 'react';

export function useMapControls() {
  const map = useMap();

  const zoomIn = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() ?? 15;
      map.setZoom(currentZoom + 1);
    }
  }, [map]);

  const zoomOut = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() ?? 15;
      map.setZoom(currentZoom - 1);
    }
  }, [map]);

  const centerOnLocation = useCallback((position: { lat: number; lng: number }) => {
    if (map) {
      map.panTo(position);
      map.setZoom(18);
    }
  }, [map]);

  return { map, zoomIn, zoomOut, centerOnLocation };
}