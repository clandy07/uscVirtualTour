'use client';

import { useState } from 'react';

interface LocationButtonProps {
  onLocationFound: (position: { lat: number; lng: number }) => void;
}

export default function LocationButton({ onLocationFound }: LocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationClick = async () => {
    setIsLoading(true);
    setError(null);


    // Strictly use Google Geolocation API
    // useGoogleGeolocation();

    try {
      // Try browser geolocation first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            onLocationFound(coords);
            setIsLoading(false);
          },
          async (geoError) => {
            console.warn('Browser geolocation failed, trying Google API:', geoError);
            // Fallback to Google Geolocation API
            await useGoogleGeolocation();
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } else {
        // No browser geolocation, use Google directly
        await useGoogleGeolocation();
      }
    } catch (err) {
      setError('Unable to retrieve your location');
      console.error('Location error:', err);
      setIsLoading(false);
    }
  };

  const useGoogleGeolocation = async () => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            considerIp: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Google Geolocation API failed');
      }

      const data = await response.json();
      
      if (data.location) {
        onLocationFound({
          lat: data.location.lat,
          lng: data.location.lng,
        });
        setIsLoading(false);
      } else {
        throw new Error('No location data received');
      }
    } catch (err) {
      setError('Unable to retrieve your location');
      console.error('Google Geolocation error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute bottom-6 right-6 z-20">
      <button
        onClick={handleLocationClick}
        disabled={isLoading}
        className={`w-14 h-14 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Get current location"
        title="Find my location"
      >
        {isLoading ? (
          <svg className="w-6 h-6 text-green-700 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
      
      {error && (
        <div className="absolute bottom-16 right-0 bg-red-100 border border-red-300 text-red-700 text-xs p-3 rounded-lg shadow-lg max-w-xs animate-slideUp">
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-sm">⚠️</span>
            <p className="flex-1">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}