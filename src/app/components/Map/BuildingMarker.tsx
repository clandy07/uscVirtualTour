'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { Building, Location } from '@/types';
import { BuildingIcon } from './CustomMarkers';

interface BuildingMarkerProps {
  building: Building;
  location: Location;
  onClick: (building: Building) => void;
  isHighlighted?: boolean;
  positionOverride?: google.maps.LatLngLiteral;
}

export default function BuildingMarker({ building, location, onClick, isHighlighted = false, positionOverride }: BuildingMarkerProps) {
  return (
    <AdvancedMarker
      position={positionOverride || location.coordinates}
      onClick={() => onClick(building)}
    >
      <div className={`relative group cursor-pointer transform hover:scale-110 transition-all ${
        isHighlighted ? 'scale-125 ring-4 ring-yellow-400 rounded-full animate-pulse' : ''
      }`}>
        <BuildingIcon />
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
          {building.name}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </AdvancedMarker>
  );
}