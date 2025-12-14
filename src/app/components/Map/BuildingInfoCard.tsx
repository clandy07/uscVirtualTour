'use client';

import { Building } from '@/types';

interface BuildingInfoCardProps {
  building: Building & {
    coordinates?: { lat: number; lng: number };
    description?: string;
    operating_hours?: string | null;
    contact_number?: string | null;
    email?: string | null;
    website_url?: string | null;
    amenities?: string[] | null;
    tags?: string[] | null;
  };
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
      <div className="p-4 space-y-3">
        {building.description && (
          <p className="text-sm text-gray-700">{building.description}</p>
        )}

        {/* Operating Hours (from location) */}
        {building.operating_hours && (
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-1">Operating Hours</p>
            <p className="text-gray-700">{building.operating_hours}</p>
          </div>
        )}

        {/* Contact Information (from location) */}
        {(building.contact_number || building.email) && (
          <div className="text-sm space-y-1">
            <p className="font-semibold text-gray-900">Contact</p>
            {building.contact_number && (
              <p className="text-gray-700">📞 {building.contact_number}</p>
            )}
            {building.email && (
              <p className="text-gray-700">✉️ {building.email}</p>
            )}
          </div>
        )}

        {/* Website (from location) */}
        {building.website_url && (
          <a
            href={building.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline inline-block"
          >
            🔗 Visit Website
          </a>
        )}

        {/* Amenities (from location) */}
        {building.amenities && building.amenities.length > 0 && (
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-2">Amenities</p>
            <div className="flex flex-wrap gap-1.5">
              {building.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags (from location) */}
        {building.tags && building.tags.length > 0 && (
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {building.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
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
