'use client';

import { Building } from '@/types';

interface BuildingInfoCardProps {
  building: Building & { coordinates?: { lat: number; lng: number }; description?: string };
  onClose: () => void;
  onGetDirections: (coordinates: { lat: number; lng: number }, name: string) => void;
  onViewDetails: () => void;
}

export default function BuildingInfoCard({ building, onClose, onGetDirections, onViewDetails }: BuildingInfoCardProps) {
  const handleGetDirections = () => {
    if (building.coordinates) {
      onGetDirections(building.coordinates, building.name);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl w-80 z-10 overflow-hidden border border-gray-200">
      {/* Header with solid red matching building marker */}
      <div className="bg-red-900 text-white px-4 py-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">{building.name}</h3>
            <p className="text-xs opacity-90 mt-1">Building</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-light leading-none transition-transform hover:rotate-90"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {building.description && (
          <p className="text-sm text-gray-700 mb-4">{building.description}</p>
        )}

        <div className="space-y-2">
          {building.coordinates && (
            <button
              onClick={handleGetDirections}
              className="w-full px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-950 font-bold transition-all hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Get Directions</span>
            </button>
          )}
          <button
            onClick={onViewDetails}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-bold transition-all hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
