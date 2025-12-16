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
    <div className="bg-white rounded-lg shadow-2xl w-56 sm:w-96 overflow-hidden border border-gray-200 flex flex-col max-h-[calc(100vh-10rem)]">
      {/* Header with category color */}
      <div className={`${categoryColors.bg} text-white px-2 sm:px-4 py-1.5 sm:py-3 flex-shrink-0`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-xs sm:text-lg font-bold truncate">{location.name}</h3>
            {location.category && (
              <p className="text-[10px] sm:text-xs opacity-90 mt-0.5 sm:mt-1 capitalize">
                {location.category.replace(/_/g, ' / ')}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-xl sm:text-2xl font-light leading-none transition-transform hover:rotate-90"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-3 overflow-y-auto flex-1">
        {location.description && (
          <p className="text-[11px] sm:text-sm text-gray-700">{location.description}</p>
        )}

        {/* Operating Hours */}
        {location.operating_hours && (
          <div className="text-[11px] sm:text-sm">
            <p className="font-semibold text-gray-900 mb-0.5 sm:mb-1">Operating Hours</p>
            <p className="text-gray-700">{location.operating_hours}</p>
          </div>
        )}

        {/* Contact Information */}
        {(location.contact_number || location.email) && (
          <div className="text-sm space-y-1">
            <p className="font-semibold text-gray-900">Contact</p>
            {location.contact_number && (
              <p className="text-gray-700">📞 {location.contact_number}</p>
            )}
            {location.email && (
              <p className="text-gray-700">✉️ {location.email}</p>
            )}
          </div>
        )}

        {/* Website */}
        {location.website_url && (
          <a
            href={location.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline inline-block"
          >
            🔗 Visit Website
          </a>
        )}

        {/* Amenities */}
        {location.amenities && location.amenities.length > 0 && (
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-2">Amenities</p>
            <div className="flex flex-wrap gap-1.5">
              {location.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {location.tags && location.tags.length > 0 && (
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {location.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 ${categoryColors.bg} bg-opacity-20 text-white text-xs rounded-full`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {location.coordinates && (
          <button
            onClick={handleGetDirections}
            className={`w-full px-4 py-2 ${categoryColors.bg} text-white rounded-lg hover:opacity-90 font-bold transition-all hover:shadow-lg flex items-center justify-center gap-2 mt-3`}
          >
            <span>Get Directions</span>
          </button>
        )}
      </div>
      </div>
  );
}
