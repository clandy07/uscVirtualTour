'use client';

import { Building } from '@/types';
import { useState } from 'react';
import FloorMap from '../Map/FloorMap';

interface BuildingPanelProps {
  building: Building | null;
  onClose: () => void;
}

export default function BuildingPanel({ building, onClose }: BuildingPanelProps) {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  // Debug logging
  console.log('BuildingPanel - building:', building);
  console.log('BuildingPanel - floor_data:', building?.floor_data);

  if (!building) return null;

  // Generate floor array from floor_count and basement_count
  const floors: number[] = [];
  if (building.basement_count && building.basement_count > 0) {
    for (let i = building.basement_count; i >= 1; i--) {
      floors.push(-i); // B1 = -1, B2 = -2, etc.
    }
  }
  if (building.floor_count && building.floor_count > 0) {
    for (let i = 1; i <= building.floor_count; i++) {
      floors.push(i);
    }
  }

  const currentFloorData = selectedFloor !== null ? building.floor_data?.[selectedFloor] : null;

  // Debug logging for floor data
  console.log('Selected floor:', selectedFloor);
  console.log('Current floor data:', currentFloorData);

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="bg-red-900 text-white px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-lg sm:text-2xl font-bold truncate">{building.name}</h2>
            <p className="text-xs sm:text-sm opacity-90">USC Talamban Campus</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl font-light leading-none transition-transform hover:rotate-90"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Building Stats */}
          <div className="p-3 sm:p-6 border-b bg-gray-50">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">Building Information</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {floors.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-fadeIn" style={{ animationDelay: '100ms' }}>
                  <p className="text-sm text-gray-500 mb-1">Total Floors</p>
                  <p className="text-lg font-semibold text-gray-900">{floors.length}</p>
                </div>
              )}
              {building.total_rooms && building.total_rooms > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                  <p className="text-sm text-gray-500 mb-1">Total Rooms</p>
                  <p className="text-lg font-semibold text-gray-900">{building.total_rooms}</p>
                </div>
              )}
            </div>

            {/* Facilities */}
            {building.facilities && building.facilities.length > 0 && (
              <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-fadeIn" style={{ animationDelay: '300ms' }}>
                <p className="text-sm font-semibold text-gray-900 mb-2">Facilities</p>
                <div className="flex flex-wrap gap-2">
                  {building.facilities.map((facility, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Accessibility Features */}
            {building.accessibility_features && building.accessibility_features.length > 0 && (
              <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-fadeIn" style={{ animationDelay: '400ms' }}>
                <p className="text-sm font-semibold text-gray-900 mb-2">♿ Accessibility Features</p>
                <div className="flex flex-wrap gap-2">
                  {building.accessibility_features.map((feature, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Fun Facts */}
            {building.fun_facts && building.fun_facts.length > 0 && (
              <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-fadeIn" style={{ animationDelay: '500ms' }}>
                <p className="text-sm font-semibold text-gray-900 mb-2">💡 Fun Facts</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {building.fun_facts.map((fact, idx) => (
                    <li key={idx}>{fact}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Floor Navigator */}
          {floors.length > 0 && (
            <div className="p-3 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">Explore Floors</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {floors.map((floor, index) => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(selectedFloor === floor ? null : floor)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-all animate-fadeIn text-sm sm:text-base ${
                      selectedFloor === floor
                        ? 'bg-red-900 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md hover:scale-105'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {floor < 0 ? `Basement ${Math.abs(floor)}` : `Floor ${floor}`}
                  </button>
                ))}
              </div>

              {/* Floor Details */}
              {selectedFloor !== null && currentFloorData && (
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 animate-slideDown">
                  <h4 className="font-bold text-lg mb-3 text-gray-900">
                    {selectedFloor < 0 ? `Basement ${Math.abs(selectedFloor)}` : `Floor ${selectedFloor}`} - Floor Map
                  </h4>
                  <div className="rounded-lg overflow-hidden border-2 border-gray-300">
                    <FloorMap
                      center={currentFloorData.center}
                      zoom={currentFloorData.zoom}
                      kmlUrl={currentFloorData.kmlUrl}
                      embedUrl={currentFloorData.embedUrl}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Interactive floor plan showing rooms and facilities
                  </p>
                </div>
              )}

              {selectedFloor !== null && !currentFloorData && (
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 animate-slideDown">
                  <h4 className="font-bold text-lg mb-2 text-gray-900">
                    {selectedFloor < 0 ? `Basement ${Math.abs(selectedFloor)}` : `Floor ${selectedFloor}`}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Floor map not available yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 bg-red-900 text-white rounded-lg hover:bg-red-950 transition-all hover:scale-105 font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}