'use client';
import React from 'react';
import { useState } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { MAP_CONFIG } from '@/app/lib/googleMaps';
import { CategoryFilter, Building } from '@/app/types';
import MapController from './MapController';

interface GoogleMapProps {
  activeFilters: CategoryFilter;
  selectedEventId?: number | null;
  onEventSelect?: (eventId: number | null) => void;
  onBuildingSelect?: (building: Building | null) => void;
}

// TODO: Replace with actual API calls to fetch locations, buildings, and events

export default function GoogleMap({ activeFilters, selectedEventId, onEventSelect, onBuildingSelect }: GoogleMapProps) {
  // TODO: Add state for fetched data from API
 
  // TODO: Fetch data from API endpoints
  

  return (
    <APIProvider apiKey={MAP_CONFIG.apiKey}>
      <Map
        defaultCenter={MAP_CONFIG.center}
        defaultZoom={MAP_CONFIG.zoom}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
        className="w-full h-full"
        disableDefaultUI={true}
        gestureHandling="greedy"
      >
        <MapController />
        
        {/* TODO: Add markers here when data is fetched from API */}
       
      </Map>

      {/* TODO: Re-enable info cards when implementing API data */}
    </APIProvider>
  );
}