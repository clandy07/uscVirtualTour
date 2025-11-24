'use client';

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapMouseEvent } from '@vis.gl/react-google-maps';
import { MAP_CONFIG } from '@/app/lib/googleMaps';

type AdminMapPickerProps = {
    coordinates: { lat: number; lng: number } | null | undefined;
    onCoordinatesSelect: (coords: { lat: number; lng: number }) => void;
};

export default function AdminMapPicker({ coordinates, onCoordinatesSelect }: AdminMapPickerProps) {
    const handleMapClick = (event: MapMouseEvent) => {
        const latLng = event.detail.latLng;
        if (latLng) {
            onCoordinatesSelect({
                lat: latLng.lat,
                lng: latLng.lng,
            });
        }
    };

    return (
        <div className="space-y-2">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                <div className="h-96 w-full border border-gray-300 rounded-lg overflow-hidden">
                    <Map
                        defaultCenter={MAP_CONFIG.center}
                        defaultZoom={MAP_CONFIG.zoom}
                        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
                        onClick={handleMapClick}
                        clickableIcons={false}
                    >
                        {coordinates && (
                            <AdvancedMarker position={coordinates}>
                                <div className="relative flex items-end justify-center">
                                    {/* Crosshair for precision */}
                                    <svg width="24" height="24" viewBox="0 0 24 24" className="absolute" style={{ transform: 'translate(-50%, -50%)', top: '0', left: '50%' }}>
                                        <circle cx="12" cy="12" r="10" fill="none" stroke="#15803d" strokeWidth="2" opacity="0.3"/>
                                        <circle cx="12" cy="12" r="2" fill="#15803d"/>
                                        <line x1="12" y1="2" x2="12" y2="8" stroke="#15803d" strokeWidth="2"/>
                                        <line x1="12" y1="16" x2="12" y2="22" stroke="#15803d" strokeWidth="2"/>
                                        <line x1="2" y1="12" x2="8" y2="12" stroke="#15803d" strokeWidth="2"/>
                                        <line x1="16" y1="12" x2="22" y2="12" stroke="#15803d" strokeWidth="2"/>
                                    </svg>
                                </div>
                            </AdvancedMarker>
                        )}
                    </Map>
                </div>
            </APIProvider>

            {coordinates && (
                <div className="text-sm text-gray-900">
                    Selected: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </div>
            )}
        </div>
    );
}
