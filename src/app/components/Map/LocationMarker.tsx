'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { Location } from '@/app/types';
import { BuildingIcon, FoodIcon, SportsIcon, StudyIcon, FacilitiesIcon, TransportIcon, DormsIcon } from './CustomMarkers';

interface LocationMarkerProps {
  location: Location;
  onClick?: (location: Location) => void;
}

const getMarkerIcon = (category: string) => {
  switch (category) {
    case 'building': return <BuildingIcon />;
    case 'food': return <FoodIcon />;
    case 'sports': return <SportsIcon />;
    case 'study': return <StudyIcon />;
    case 'facilities': return <FacilitiesIcon />;
    case 'transport': return <TransportIcon />;
    case 'dorms': return <DormsIcon />;
    default: return <FacilitiesIcon />;
  }
};

export default function LocationMarker({ location, onClick }: LocationMarkerProps) {
  return (
    <AdvancedMarker
      position={location.coordinates}
      onClick={() => onClick?.(location)}
    >
      <div className="relative group cursor-pointer transform hover:scale-110 transition-transform">
        {getMarkerIcon(location.category)}
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
          {location.name}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </AdvancedMarker>
  );
}