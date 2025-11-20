'use client';

import { Building } from '@/types';
import { useState } from 'react';

interface BuildingPanelProps {
  building: Building | null;
  onClose: () => void;
}

export default function BuildingPanel({ building, onClose }: BuildingPanelProps) {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  if (!building) return null;

  const floors = building.floor_array?.sort((a, b) => a - b) || [];

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-yellow-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{building.name}</h2>
            <p className="text-sm opacity-90">USC Talamban Campus</p>
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
          <div className="p-6 border-b bg-gray-50">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Building Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-fadeIn" style={{ animationDelay: '100ms' }}>
                <p className="text-sm text-gray-500 mb-1">Building ID</p>
                <p className="text-lg font-semibold text-gray-900">{building.id}</p>
              </div> */}
              {floors.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                  <p className="text-sm text-gray-500 mb-1">Total Floors</p>
                  <p className="text-lg font-semibold text-gray-900">{floors.length}</p>
                </div>
              )}
            </div>
          </div>

          {/* Floor Navigator */}
          {floors.length > 0 && (
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Explore Floors</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {floors.map((floor, index) => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(selectedFloor === floor ? null : floor)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all animate-fadeIn ${
                      selectedFloor === floor
                        ? 'bg-red-700 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md hover:scale-105'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    Floor {floor}
                  </button>
                ))}
              </div>

              {/* Floor Details */}
              {selectedFloor !== null && (
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 animate-slideDown">
                  <h4 className="font-bold text-lg mb-2 text-gray-900">
                    Floor {selectedFloor}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Floor information and room details coming soon.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-all hover:scale-105 font-medium shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}