'use client';
import React from 'react';
import { useState } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { MAP_CONFIG } from '@/app/lib/googleMaps';
import { MOCK_LOCATIONS, MOCK_EVENTS } from '@/app/lib/mockData';
import { CategoryFilter, Location, Event } from '@/app/types';
import MapController from './MapController';
import LocationMarker from './LocationMarker';
import EventMarker from './EventMarker';

interface GoogleMapProps {
  activeFilters: CategoryFilter;
  selectedEventId?: number | null;
  onEventSelect?: (eventId: number | null) => void;
}

export default function GoogleMap({ activeFilters, selectedEventId, onEventSelect }: GoogleMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ event: Event; location: Location } | null>(null);

  const getFilteredLocations = () => {
    return MOCK_LOCATIONS.filter(location => {
      // Check if the location's category is enabled in filters
      return activeFilters[location.category as keyof CategoryFilter];
    });
  };

  const getFilteredEvents = () => {
    if (!activeFilters.events) return [];
    
    return MOCK_EVENTS.map(event => {
      const location = MOCK_LOCATIONS.find(loc => loc.id === event.location_id);
      return location ? { event, location } : null;
    }).filter(item => item !== null) as { event: Event; location: Location }[];
  };

  const filteredLocations = getFilteredLocations();
  const filteredEvents = getFilteredEvents();

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setSelectedEvent(null);
    onEventSelect?.(null);
  };

  const handleEventClick = (event: Event, location: Location) => {
    setSelectedEvent({ event, location });
    setSelectedLocation(null);
    onEventSelect?.(event.id);
  };

  // Handle event selection from EventsPanel
  React.useEffect(() => {
    if (selectedEventId) {
      const event = MOCK_EVENTS.find(e => e.id === selectedEventId);
      if (event) {
        const location = MOCK_LOCATIONS.find(loc => loc.id === event.location_id);
        if (location) {
          handleEventClick(event, location);
        }
      }
    }
  }, [selectedEventId]);

  return (
    <APIProvider apiKey={MAP_CONFIG.apiKey}>
      <Map
        defaultCenter={MAP_CONFIG.center}
        defaultZoom={MAP_CONFIG.zoom}
        mapId="1255c889f9110b35d6071258"
        className="w-full h-full"
        disableDefaultUI={true}
        gestureHandling="greedy"
      >
        <MapController />
        
        {/* Render location markers */}
        {filteredLocations.map((location) => (
          <LocationMarker
            key={`location-${location.id}`}
            location={location}
            onClick={handleLocationClick}
          />
        ))}

        {/* Render event markers */}
        {filteredEvents.map(({ event, location }) => (
          <EventMarker
            key={`event-${event.id}`}
            event={event}
            location={location}
            onClick={handleEventClick}
          />
        ))}
      </Map>

      {/* Info card for selected location */}
      {selectedLocation && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-xl z-30 max-w-sm w-80">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-800">{selectedLocation.name}</h3>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium mr-2">
              {selectedLocation.category}
            </span>
          </p>
          {selectedLocation.description && (
            <p className="text-sm text-gray-700 mb-3">{selectedLocation.description}</p>
          )}
          <button className="w-full bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded transition-colors text-sm font-medium">
            Get Directions
          </button>
        </div>
      )}

      {/* Info card for selected event */}
      {selectedEvent && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-xl z-30 max-w-sm w-80">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-800">📅 {selectedEvent.event.theme}</h3>
            <button
              onClick={() => {
                setSelectedEvent(null);
                onEventSelect?.(null);
              }}
              className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Location:</span> {selectedEvent.location.name}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Start:</span>{' '}
            {new Date(selectedEvent.event.date_time_start).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium">End:</span>{' '}
            {new Date(selectedEvent.event.date_time_end).toLocaleString()}
          </p>
          {selectedEvent.event.description && (
            <p className="text-sm text-gray-700 mb-3">{selectedEvent.event.description}</p>
          )}
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors text-sm font-medium">
            View Event Details
          </button>
        </div>
      )}
    </APIProvider>
  );
}