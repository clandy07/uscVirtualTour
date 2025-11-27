'use client';

import { Location } from '@/types';

interface LocationInfoCardProps {
  location: Location & { coordinates?: { lat: number; lng: number } };
  onClose: () => void;
  onGetDirections: (coordinates: { lat: number; lng: number }, name: string) => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    'buildings': { bg: 'bg-red-900', text: 'text-red-900', border: 'border-red-900' },
    'events': { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
    'food': { bg: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-600' },
    'facilities': { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-600' },
    'transport_parking': { bg: 'bg-gray-600', text: 'text-gray-600', border: 'border-gray-600' },
    'study_areas': { bg: 'bg-cyan-600', text: 'text-cyan-600', border: 'border-cyan-600' },
    'dorms_residences': { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-600' },
    'sports_recreation': { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-600' },
  };
  return colors[category] || { bg: 'bg-gray-600', text: 'text-gray-600', border: 'border-gray-600' };
};

export default function LocationInfoCard({ location, onClose, onGetDirections }: LocationInfoCardProps) {
  const handleGetDirections = () => {
    if (location.coordinates) {
      onGetDirections(location.coordinates, location.name);
    }
  };

  const categoryColors = location.category ? getCategoryColor(location.category) : { bg: 'bg-gray-600', text: 'text-gray-600', border: 'border-gray-600' };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl w-80 z-10 overflow-hidden border border-gray-200">
      {/* Header with category color */}
      <div className={`${categoryColors.bg} text-white px-4 py-3`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">{location.name}</h3>
            {location.category && (
              <p className="text-xs opacity-90 mt-1 capitalize">
                {location.category.replace(/_/g, ' ')}
              </p>
            )}
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
        {location.description && (
          <p className="text-sm text-gray-700 mb-4">{location.description}</p>
        )}

        {location.coordinates && (
          <button
            onClick={handleGetDirections}
            className={`w-full px-4 py-2 ${categoryColors.bg} text-white rounded-lg hover:opacity-90 font-bold transition-all hover:shadow-lg flex items-center justify-center gap-2`}
          >
            <span>Get Directions</span>
          </button>
        )}
      </div>
    </div>
  );
}
