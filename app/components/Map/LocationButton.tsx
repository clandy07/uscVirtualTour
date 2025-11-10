'use client';

import { useState } from 'react';

interface LocationButtonProps {
  onLocationFound: (position: { lat: number; lng: number }) => void;
}

export default function LocationButton({ onLocationFound }: LocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationClick = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onLocationFound(coords);
        setIsLoading(false);
      },
      (error) => {
        setError('Unable to retrieve your location');
        console.error('Geolocation error:', error);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="absolute bottom-6 right-6 z-20">
      <button
        onClick={handleLocationClick}
        disabled={isLoading}
        className={`w-14 h-14 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Get current location"
      >
        <div className={`w-8 h-8 border-4 border-green-700 rounded-full relative ${isLoading ? 'animate-pulse' : ''}`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-green-700 rounded-full" />
        </div>
      </button>
      {error && (
        <div className="absolute bottom-16 right-0 bg-red-100 text-red-700 text-xs p-2 rounded shadow-lg whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}