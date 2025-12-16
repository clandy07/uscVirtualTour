'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';

interface ClusterMarkerProps {
  position: google.maps.LatLngLiteral;
  count: number;
  onClick: () => void;
}

export default function ClusterMarker({ position, count, onClick }: ClusterMarkerProps) {
  return (
    <AdvancedMarker position={position} onClick={onClick}>
      <div className="relative cursor-pointer transform hover:scale-110 transition-all">
        {/* Cluster circle with count */}
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full shadow-lg border-4 border-white">
          <span className="text-white font-bold text-base">{count}</span>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
          {count} items at this location
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </AdvancedMarker>
  );
}
