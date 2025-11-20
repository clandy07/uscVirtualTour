'use client';
import React from 'react';
import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MAP_CONFIG } from '@/app/lib/googleMaps';
import { MOCK_LOCATIONS, MOCK_EVENTS, MOCK_BUILDINGS } from '@/app/lib/mockData';
import { CategoryFilter, Location, Event, Building } from '@/app/types';
import MapController from './MapController';
import LocationMarker from './LocationMarker';
import EventMarker from './EventMarker';
import BuildingMarker from './BuildingMarker';

interface GoogleMapProps {
  activeFilters: CategoryFilter;
  selectedEventId?: number | null;
  onEventSelect?: (eventId: number | null) => void;
  onBuildingSelect?: (building: Building | null) => void;
}

interface MarkerItem {
  type: 'location' | 'building' | 'event';
  id: number;
  name: string;
  data: Location | { building: Building; location: Location } | { event: Event; location: Location };
  coordinates: { lat: number; lng: number };
}

export default function GoogleMap({ activeFilters, selectedEventId, onEventSelect, onBuildingSelect }: GoogleMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ event: Event; location: Location } | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<{ building: Building; location: Location } | null>(null);
  const [showClusterList, setShowClusterList] = useState<string | null>(null);

  const getFilteredLocations = () => {
    return MOCK_LOCATIONS.filter(location => {
      if (location.category === 'building') return false;
      return activeFilters[location.category as keyof CategoryFilter];
    });
  };

  const getFilteredBuildings = () => {
    if (!activeFilters.building) return [];
    
    return MOCK_BUILDINGS.map(building => {
      const location = MOCK_LOCATIONS.find(loc => loc.id === building.location_id);
      return location ? { building, location } : null;
    }).filter(item => item !== null) as { building: Building; location: Location }[];
  };

  const getFilteredEvents = () => {
    if (!activeFilters.events) return [];
    
    return MOCK_EVENTS.map(event => {
      const location = MOCK_LOCATIONS.find(loc => loc.id === event.location_id);
      return location ? { event, location } : null;
    }).filter(item => item !== null) as { event: Event; location: Location }[];
  };

  const filteredLocations = getFilteredLocations();
  const filteredBuildings = getFilteredBuildings();
  const filteredEvents = getFilteredEvents();

  // Group markers by coordinates
  const groupMarkersByCoordinates = () => {
    const groups: { [key: string]: MarkerItem[] } = {};

    // Add locations
    filteredLocations.forEach(location => {
      const key = `${location.coordinates.lat.toFixed(5)},${location.coordinates.lng.toFixed(5)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push({
        type: 'location',
        id: location.id,
        name: location.name,
        data: location,
        coordinates: location.coordinates,
      });
    });

    // Add buildings
    filteredBuildings.forEach(({ building, location }) => {
      const key = `${location.coordinates.lat.toFixed(5)},${location.coordinates.lng.toFixed(5)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push({
        type: 'building',
        id: building.id,
        name: building.name,
        data: { building, location },
        coordinates: location.coordinates,
      });
    });

    // Add events
    filteredEvents.forEach(({ event, location }) => {
      const key = `${location.coordinates.lat.toFixed(5)},${location.coordinates.lng.toFixed(5)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push({
        type: 'event',
        id: event.id,
        name: event.theme,
        data: { event, location },
        coordinates: location.coordinates,
      });
    });

    return groups;
  };

  const markerGroups = groupMarkersByCoordinates();

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setSelectedEvent(null);
    setSelectedBuilding(null);
    setShowClusterList(null);
    onEventSelect?.(null);
    onBuildingSelect?.(null);
  };

  const handleBuildingClick = (building: Building, location: Location) => {
    setSelectedBuilding({ building, location });
    setSelectedLocation(null);
    setSelectedEvent(null);
    setShowClusterList(null);
    onEventSelect?.(null);
  };

  const handleViewBuildingDetails = () => {
    if (selectedBuilding) {
      onBuildingSelect?.(selectedBuilding.building);
      setSelectedBuilding(null);
    }
  };

  const handleEventClick = (event: Event, location: Location) => {
    setSelectedEvent({ event, location });
    setSelectedLocation(null);
    setSelectedBuilding(null);
    setShowClusterList(null);
    onEventSelect?.(event.id);
    onBuildingSelect?.(null);
  };

  const handleMarkerItemClick = (item: MarkerItem) => {
    if (item.type === 'location') {
      handleLocationClick(item.data as Location);
    } else if (item.type === 'building') {
      const { building, location } = item.data as { building: Building; location: Location };
      handleBuildingClick(building, location);
    } else if (item.type === 'event') {
      const { event, location } = item.data as { event: Event; location: Location };
      handleEventClick(event, location);
    }
  };

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
        
        {Object.entries(markerGroups).map(([key, items]) => {
          // If only one marker at this location, render it normally
          if (items.length === 1) {
            const item = items[0];
            if (item.type === 'location') {
              return (
                <LocationMarker
                  key={`location-${item.id}`}
                  location={item.data as Location}
                  onClick={handleLocationClick}
                />
              );
            } else if (item.type === 'building') {
              const { building, location } = item.data as { building: Building; location: Location };
              return (
                <BuildingMarker
                  key={`building-${item.id}`}
                  building={building}
                  location={location}
                  onClick={(bldg) => handleBuildingClick(bldg, location)}
                />
              );
            } else if (item.type === 'event') {
              const { event, location } = item.data as { event: Event; location: Location };
              return (
                <EventMarker
                  key={`event-${item.id}`}
                  event={event}
                  location={location}
                  onClick={handleEventClick}
                />
              );
            }
          }

          // Multiple markers at same location - show cluster
          return (
            <AdvancedMarker
              key={`cluster-${key}`}
              position={items[0].coordinates}
              onClick={() => setShowClusterList(showClusterList === key ? null : key)}
            >
              <div className="relative cursor-pointer">
                <div 
                  className="w-12 h-12 rounded-full bg-green-700 border-4 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <span className="text-white font-bold text-sm">{items.length}</span>
                </div>
              </div>
            </AdvancedMarker>
          );
        })}
      </Map>

      {/* Cluster List Popup */}
      {showClusterList && markerGroups[showClusterList] && (
        <div className="fixed bottom-20 left-1/2 flex justify-center z-30 animate-slideUp px-4">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-sm w-80">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-gray-800">
                {markerGroups[showClusterList].length} items at this location
              </h3>
              <button
                onClick={() => setShowClusterList(null)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {markerGroups[showClusterList].map((item, index) => (
                <button
                  key={`${item.type}-${item.id}-${index}`}
                  onClick={() => handleMarkerItemClick(item)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {item.type === 'location' && '📍'}
                      {item.type === 'building' && '🏛️'}
                      {item.type === 'event' && '📅'}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info card for selected location */}
      {selectedLocation && (
        <div className="fixed bottom-20 left-1/2 flex justify-center z-30 animate-slideUp px-4">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-sm w-80">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-800">📍 {selectedLocation.name}</h3>
              <button onClick={() => setSelectedLocation(null)} className="text-gray-500 hover:text-gray-700 text-xl leading-none transition-colors">×</button>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium mr-2">{selectedLocation.category}</span>
            </p>
            {selectedLocation.description && <p className="text-sm text-gray-700 mb-3">{selectedLocation.description}</p>}
            <button className="w-full bg-green-700 hover:bg-green-800 text-white text-bold py-2 px-4 rounded transition-all hover:scale-105 text-sm font-bold">Get Directions</button>
          </div>
        </div>
      )}

      {/* Info card for selected building */}
      {selectedBuilding && (
        <div className="fixed bottom-20 left-1/2 flex justify-center z-30 animate-slideUp px-4">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-sm w-80">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-800">🏛️ {selectedBuilding.building.name}</h3>
              <button onClick={() => setSelectedBuilding(null)} className="text-gray-500 hover:text-gray-700 text-xl leading-none transition-colors">×</button>
            </div>
            {selectedBuilding.building.description && <div className="mb-3"><span className="text-sm text-gray-600">{selectedBuilding.building.description}</span></div>}
            <button onClick={handleViewBuildingDetails} className="w-full bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded transition-all hover:scale-105 text-sm font-bold">View Building Details</button>
          </div>
        </div>
      )}

      {/* Info card for selected event */}
      {selectedEvent && (
        <div className="fixed bottom-20 left-1/2 flex justify-center z-30 animate-slideUp px-4">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-sm w-80">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-800">📅 {selectedEvent.event.theme}</h3>
              <button onClick={() => { setSelectedEvent(null); onEventSelect?.(null); }} className="text-gray-500 hover:text-gray-700 text-xl leading-none transition-colors">×</button>
            </div>
            <p className="text-sm text-gray-600 mb-2"><span className="font-bold">Location:</span> {selectedEvent.location.name}</p>
            <p className="text-sm text-gray-600 mb-2"><span className="font-bold">Start:</span> {new Date(selectedEvent.event.date_time_start).toLocaleString()}</p>
            <p className="text-sm text-gray-600 mb-3"><span className="font-bold">End:</span> {new Date(selectedEvent.event.date_time_end).toLocaleString()}</p>
            {selectedEvent.event.description && <p className="text-sm text-gray-700 mb-3">{selectedEvent.event.description}</p>}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-all hover:scale-105 text-sm font-bold">View Event Details</button>
          </div>
        </div>
      )}
    </APIProvider>
  );
}