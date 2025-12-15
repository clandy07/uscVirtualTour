'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { MAP_CONFIG } from '@/app/lib/googleMaps';
import { CategoryFilter, Building, Location } from '@/types';
import MapController from './MapController';
import RouteCalculator from './RouteCalculator';
import RouteInfoPanel from './RouteInfoPanel';
import BuildingMarker from './BuildingMarker';
import LocationMarker from './LocationMarker';
import BuildingInfoCard from './BuildingInfoCard';
import LocationInfoCard from './LocationInfoCard';
import SearchPanner from './SearchPanner';

interface GoogleMapProps {
  activeFilters: CategoryFilter;
  selectedEventId?: number | null;
  onEventSelect?: (eventId: number | null) => void;
  onBuildingSelect?: (building: Building | null) => void;
  searchResult?: { coordinates: { lat: number; lng: number }; type: 'building' | 'location'; buildingData?: Building; locationData?: Location } | null;
  mapType?: string;
  onClearSearchResult?: () => void;
}

export default function GoogleMap({ activeFilters, selectedEventId, onEventSelect, onBuildingSelect, searchResult, mapType = 'roadmap', onClearSearchResult }: GoogleMapProps) {
  // Data state
  const [campuses, setCampuses] = useState<{ id: number; name: string }[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Selected items state
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  
  // Route state
  const [routeOrigin, setRouteOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [routeDestination, setRouteDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [routeResult, setRouteResult] = useState<google.maps.DirectionsResult | null>(null);
  const [destinationName, setDestinationName] = useState<string>('');

  // Fetch campuses and their data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all campuses
        const campusesResponse = await fetch('/api/campuses');
        const campusesData = await campusesResponse.json();
        
        if (campusesData.success) {
          setCampuses(campusesData.data);
          
          // Fetch locations and buildings for all campuses
          const allLocations: Location[] = [];
          const allBuildings: Building[] = [];
          
          for (const campus of campusesData.data) {
            // Fetch locations
            const locationsResponse = await fetch(`/api/campuses/${campus.id}/locations`);
            const locationsData = await locationsResponse.json();
            
            if (locationsData.success) {
              // Parse coordinates and add to locations
              const parsedLocations = locationsData.data.map((loc: any) => ({
                ...loc,
                coordinates: loc.latitude && loc.longitude ? {
                  lat: parseFloat(loc.latitude),
                  lng: parseFloat(loc.longitude)
                } : undefined
              }));
              allLocations.push(...parsedLocations);
            }
            
            // Fetch buildings
            const buildingsResponse = await fetch(`/api/campuses/${campus.id}/buildings`);
            const buildingsData = await buildingsResponse.json();
            
            if (buildingsData.success) {
              allBuildings.push(...buildingsData.data);
            }
          }
          
          setLocations(allLocations);
          setBuildings(allBuildings);
        }
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle search result selection
  useEffect(() => {
    if (searchResult) {
      if (searchResult.type === 'building' && searchResult.buildingData) {
        // Find the complete building with location
        const building = buildings.find(b => b.id === searchResult.buildingData?.id);
        if (building) {
          setSelectedBuilding(building);
          setSelectedLocation(null);
        }
      } else if (searchResult.type === 'location' && searchResult.locationData) {
        // Find the complete location with coordinates
        const location = locations.find(l => l.id === searchResult.locationData?.id);
        if (location) {
          setSelectedLocation(location);
          setSelectedBuilding(null);
        }
      }
    }
  }, [searchResult, buildings, locations]);
  

  // Handle getting directions - attempts to use user's current location
  const handleGetDirections = (destination: { lat: number; lng: number }, name: string) => {
    // Close info cards when getting directions
    setSelectedLocation(null);
    setSelectedBuilding(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setRouteOrigin({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setRouteDestination(destination);
          setDestinationName(name);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to campus center
          setRouteOrigin(MAP_CONFIG.center);
          setRouteDestination(destination);
          setDestinationName(name);
        }
      );
    } else {
      // Fallback to campus center if geolocation not supported
      setRouteOrigin(MAP_CONFIG.center);
      setRouteDestination(destination);
      setDestinationName(name);
    }
  };

  // Clear route
  const handleClearRoute = () => {
    setRouteOrigin(null);
    setRouteDestination(null);
    setRouteResult(null);
    setDestinationName('');
    // Close info cards when route is cleared
    setSelectedLocation(null);
    setSelectedBuilding(null);
  };
  
  // Handle location click
  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setSelectedBuilding(null);
  };
  
  // Handle building click
  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
    setSelectedLocation(null);
  };
  
  // Handle view building details
  const handleViewBuildingDetails = () => {
    if (selectedBuilding) {
      onBuildingSelect?.(selectedBuilding);
    }
  };
  
  // Filter locations and buildings based on active filters
  const filteredLocations = locations.filter(location => {
    if (!location.category) return false;
    return activeFilters[location.category as keyof CategoryFilter];
  });
  
  const filteredBuildings = buildings.filter(building => {
    return activeFilters.buildings;
  });

  return (
    <APIProvider apiKey={MAP_CONFIG.apiKey}>
      <Map
        defaultCenter={MAP_CONFIG.center}
        defaultZoom={MAP_CONFIG.zoom}
        minZoom={15}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
        className="w-full h-full"
        disableDefaultUI={true}
        gestureHandling="greedy"
        mapTypeId={mapType}
      >
        <MapController />
        <SearchPanner searchResult={searchResult || null} />
        
        <RouteCalculator
          origin={routeOrigin}
          destination={routeDestination}
          onRouteCalculated={setRouteResult}
          onClearRoute={() => setRouteResult(null)}
        />
        
        {/* Render location markers */}
        {!isLoading && filteredLocations.map((location) => {
          // Don't render location marker if it has a building (building marker will be shown instead)
          const hasBuilding = buildings.some(b => b.location_id === location.id);
          if (hasBuilding || !location.coordinates) return null;
          
          return (
            <LocationMarker
              key={`location-${location.id}`}
              location={location}
              onClick={handleLocationClick}
              isHighlighted={searchResult?.type === 'location' && searchResult?.locationData?.id === location.id}
            />
          );
        })}
        
        {/* Render building markers */}
        {!isLoading && filteredBuildings.map((building) => {
          const location = locations.find(l => l.id === building.location_id);
          if (!location || !location.coordinates) return null;
          
          return (
            <BuildingMarker
              key={`building-${building.id}`}
              building={building}
              location={location}
              onClick={handleBuildingClick}
              isHighlighted={searchResult?.type === 'building' && searchResult?.buildingData?.id === building.id}
            />
          );
        })}
       
      </Map>

      <RouteInfoPanel
        route={routeResult}
        destinationName={destinationName}
        onClose={handleClearRoute}
      />

      {/* Location Info Card */}
      {selectedLocation && selectedLocation.coordinates && (
        <LocationInfoCard
          location={selectedLocation}
          onClose={() => {
            setSelectedLocation(null);
            onClearSearchResult?.();
          }}
          onGetDirections={handleGetDirections}
        />
      )}
      
      {/* Building Info Card */}
      {selectedBuilding && (() => {
        const location = locations.find(l => l.id === selectedBuilding.location_id);
        if (!location || !location.coordinates) return null;
        
        return (
          <BuildingInfoCard
            building={{
              ...selectedBuilding,
              coordinates: location.coordinates,
              description: location.description,
              operating_hours: location.operating_hours,
              contact_number: location.contact_number,
              email: location.email,
              website_url: location.website_url,
              amenities: location.amenities,
              tags: location.tags
            }}
            onClose={() => {
              setSelectedBuilding(null);
              onClearSearchResult?.();
            }}
            onGetDirections={handleGetDirections}
            onViewDetails={handleViewBuildingDetails}
          />
        );
      })()}
    </APIProvider>
  );
}