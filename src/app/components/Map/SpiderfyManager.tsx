'use client';
import { useEffect, useState, useRef } from 'react';

export interface SpiderfyMarker {
  id: string | number;
  position: google.maps.LatLngLiteral;
  type: 'building' | 'location' | 'event';
}

/**
 * Hook to manage spiderfying (spreading out) overlapping markers
 */
export function useSpiderfyManager(markers: SpiderfyMarker[], enabled: boolean = true) {
  const [overlappingGroups, setOverlappingGroups] = useState<Map<string, SpiderfyMarker[]>>(new Map());
  const [activeSpiderfyGroup, setActiveSpiderfyGroup] = useState<string | null>(null);
  const [spiderfiedPositions, setSpiderfiedPositions] = useState<Map<string | number, google.maps.LatLngLiteral>>(new Map());

  // Use ref to track previous markers string to prevent infinite loops
  const prevMarkersStringRef = useRef<string>('');

  // Group markers by coordinates (find overlapping markers)
  useEffect(() => {
    if (!enabled) {
      setOverlappingGroups(new Map());
      prevMarkersStringRef.current = '';
      return;
    }

    // Create a stable string representation for comparison
    const markersString = JSON.stringify(
      markers.map(m => ({ id: m.id, lat: m.position.lat.toFixed(6), lng: m.position.lng.toFixed(6) }))
    );

    // Skip if markers haven't actually changed
    if (markersString === prevMarkersStringRef.current) {
      return;
    }
    prevMarkersStringRef.current = markersString;

    const groups = new Map<string, SpiderfyMarker[]>();
    
    markers.forEach(marker => {
      // Create a key from rounded coordinates to group overlapping markers
      const key = `${marker.position.lat.toFixed(6)},${marker.position.lng.toFixed(6)}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(marker);
    });

    // Only keep groups with more than one marker (overlapping)
    const overlapping = new Map<string, SpiderfyMarker[]>();
    groups.forEach((groupMarkers, key) => {
      if (groupMarkers.length > 1) {
        overlapping.set(key, groupMarkers);
      }
    });

    setOverlappingGroups(overlapping);
  }, [markers, enabled]);

  /**
   * Calculate spiderfied positions in a circle/radial pattern
   */
  const calculateSpiderfiedPositions = (
    centerLat: number,
    centerLng: number,
    count: number,
    radiusMeters: number = 25
  ): google.maps.LatLngLiteral[] => {
    const positions: google.maps.LatLngLiteral[] = [];
    const angleStep = (2 * Math.PI) / count;
    
    // Convert meters to degrees (approximate)
    // This is a rough approximation; for more accuracy, use proper geo calculations
    const metersPerDegree = 111320; // at equator
    const latOffset = radiusMeters / metersPerDegree;
    const lngOffset = radiusMeters / (metersPerDegree * Math.cos(centerLat * Math.PI / 180));

    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      positions.push({
        lat: centerLat + (latOffset * Math.cos(angle)),
        lng: centerLng + (lngOffset * Math.sin(angle))
      });
    }

    return positions;
  };

  /**
   * Spiderfy (spread out) a group of overlapping markers
   */
  const spiderfyGroup = (groupKey: string) => {
    const groupMarkers = overlappingGroups.get(groupKey);
    if (!groupMarkers || groupMarkers.length === 0) return;

    const centerPos = groupMarkers[0].position;
    const positions = calculateSpiderfiedPositions(
      centerPos.lat,
      centerPos.lng,
      groupMarkers.length,
      25 // 25 meters radius
    );

    const newSpiderfiedMap = new Map<string | number, google.maps.LatLngLiteral>();
    groupMarkers.forEach((marker, index) => {
      newSpiderfiedMap.set(marker.id, positions[index]);
    });

    setSpiderfiedPositions(newSpiderfiedMap);
    setActiveSpiderfyGroup(groupKey);
  };

  /**
   * Collapse spiderfied markers back to original position
   */
  const collapseSpiderfy = () => {
    setSpiderfiedPositions(new Map());
    setActiveSpiderfyGroup(null);
  };

  /**
   * Get the position of a marker (spiderfied if active, otherwise original)
   */
  const getMarkerPosition = (markerId: string | number, originalPosition: google.maps.LatLngLiteral): google.maps.LatLngLiteral => {
    if (enabled && spiderfiedPositions.has(markerId)) {
      return spiderfiedPositions.get(markerId)!;
    }
    return originalPosition;
  };

  /**
   * Check if a position has overlapping markers
   */
  const getPositionKey = (position: google.maps.LatLngLiteral): string => {
    return `${position.lat.toFixed(6)},${position.lng.toFixed(6)}`;
  };

  const isOverlapping = (position: google.maps.LatLngLiteral): boolean => {
    const key = getPositionKey(position);
    return overlappingGroups.has(key);
  };

  /**
   * Check if a marker is currently spiderfied
   */
  const isSpiderfied = (markerId: string | number): boolean => {
    return spiderfiedPositions.has(markerId);
  };

  /**
   * Handle click on a marker that might be part of an overlapping group
   * Returns true if spiderfying was triggered, false if normal click should proceed
   */
  const handleOverlapClick = (marker: SpiderfyMarker): boolean => {
    if (!enabled) return false;

    const groupKey = getPositionKey(marker.position);
    
    if (overlappingGroups.has(groupKey)) {
      const group = overlappingGroups.get(groupKey)!;
      
      // If this group is already spiderfied, allow normal click through
      if (activeSpiderfyGroup === groupKey) {
        return false; // Don't intercept, allow normal marker click
      } else {
        // Spiderfy this group
        spiderfyGroup(groupKey);
        return true; // Intercept the click
      }
    }
    
    return false; // No overlapping, allow normal click
  };

  return {
    overlappingGroups,
    activeSpiderfyGroup,
    spiderfiedPositions,
    getMarkerPosition,
    isOverlapping,
    isSpiderfied,
    handleOverlapClick,
    collapseSpiderfy,
    spiderfyGroup,
  };
}
