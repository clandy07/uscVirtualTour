'use client';
import React, { useEffect, useMemo } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

/**
 * Simple clustering logic that groups nearby markers at different zoom levels
 * Returns whether markers should be visible based on zoom level and proximity
 */

export interface ClusterableMarker {
  id: string | number;
  position: google.maps.LatLngLiteral;
}

export interface ClusterGroup {
  center: google.maps.LatLngLiteral;
  markers: ClusterableMarker[];
  count: number;
}

/**
 * Calculate distance between two coordinates in meters
 */
function getDistance(pos1: google.maps.LatLngLiteral, pos2: google.maps.LatLngLiteral): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = pos1.lat * Math.PI / 180;
  const φ2 = pos2.lat * Math.PI / 180;
  const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
  const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

/**
 * Group markers into clusters based on distance threshold
 */
export function clusterMarkers(
  markers: ClusterableMarker[], 
  distanceThreshold: number
): ClusterGroup[] {
  if (markers.length === 0) return [];
  
  const clusters: ClusterGroup[] = [];
  const processed = new Set<string | number>();

  markers.forEach(marker => {
    if (processed.has(marker.id)) return;

    const cluster: ClusterGroup = {
      center: marker.position,
      markers: [marker],
      count: 1,
    };

    // Find nearby markers
    markers.forEach(otherMarker => {
      if (marker.id === otherMarker.id || processed.has(otherMarker.id)) return;
      
      const distance = getDistance(marker.position, otherMarker.position);
      if (distance < distanceThreshold) {
        cluster.markers.push(otherMarker);
        cluster.count++;
        processed.add(otherMarker.id);
      }
    });

    processed.add(marker.id);
    
    // Calculate center of cluster
    if (cluster.count > 1) {
      const avgLat = cluster.markers.reduce((sum, m) => sum + m.position.lat, 0) / cluster.count;
      const avgLng = cluster.markers.reduce((sum, m) => sum + m.position.lng, 0) / cluster.count;
      cluster.center = { lat: avgLat, lng: avgLng };
    }
    
    clusters.push(cluster);
  });

  return clusters;
}

/**
 * Hook to use clustering with the current map zoom level
 */
export function useMarkerClustering(markers: ClusterableMarker[], enabled: boolean = true) {
  const map = useMap();
  const [zoom, setZoom] = React.useState(map?.getZoom() || 17);

  useEffect(() => {
    if (!map) return;

    const handleZoomChanged = () => {
      setZoom(map.getZoom() || 17);
    };

    const listener = map.addListener('zoom_changed', handleZoomChanged);

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map]);

  const clusters = useMemo(() => {
    if (!enabled || zoom >= 17) {
      // Don't cluster at high zoom levels
      return markers.map(m => ({
        center: m.position,
        markers: [m],
        count: 1,
      }));
    }

    // Adjust clustering distance based on zoom level
    // Lower zoom = larger distance threshold
    const baseDistance = 100; // meters
    const zoomFactor = Math.pow(2, 17 - zoom);
    const distanceThreshold = baseDistance * zoomFactor;

    return clusterMarkers(markers, distanceThreshold);
  }, [markers, zoom, enabled]);

  return { clusters, zoom, shouldCluster: enabled && zoom < 17 };
}

// Note: For a full clustering implementation with visual cluster markers,
// we would need to render custom cluster components. For now, this provides
// the logic to group markers, which can be used to conditionally render
// markers or create cluster representations.
