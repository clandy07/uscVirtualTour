"use client";

import { useState, useEffect } from "react";
import GoogleMap from "./components/Map/GoogleMap";
import Sidebar from "./components/Sidebar/Sidebar";
import EventsPanel from "./components/Events/EventsPanel";
import BuildingPanel from "./components/Buildings/BuildingPanel";
import ProfileMenu from "./components/Profile/ProfileMenu";
import Image from "next/image";
import { CategoryFilter, Building, Location } from "@/types";
import { buildingIcon, locationIcon } from "@/app/lib/icons";

import { uscLogo }  from "../app/lib/icons";

type SearchResult = {
	id: number;
	name: string;
	type: 'building' | 'location';
	coordinates: { lat: number; lng: number };
	campusName: string;
	campusId: number;
	buildingData?: Building;
	locationData?: Location;
};

export default function Home() {
	const [activeFilters, setActiveFilters] = useState<CategoryFilter>({
		buildings: true,
		events: false,
		food: true,
		facilities: false,
		transport_parking: false,
		study_areas: true,
		dorms_residences: false,
		sports_recreation: true,
	});
	const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
	const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
		null
	);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [showSearchResults, setShowSearchResults] = useState(false);
	const [allLocations, setAllLocations] = useState<Location[]>([]);
	const [allBuildings, setAllBuildings] = useState<Building[]>([]);
	const [selectedSearchResult, setSelectedSearchResult] = useState<SearchResult | null>(null);
	const [mapType, setMapType] = useState<string>('roadmap');

	// Fetch all locations and buildings for search
	useEffect(() => {
		const fetchData = async () => {
			try {
				const campusesRes = await fetch('/api/campuses');
				const campusesData = await campusesRes.json();

				if (!campusesData.success) {
					console.error('Failed to fetch campuses');
					return;
				}

				const campuses = campusesData.data;
				let locations: Location[] = [];
				let buildings: Building[] = [];

				for (const campus of campuses) {
					const [locationsRes, buildingsRes] = await Promise.all([
						fetch(`/api/campuses/${campus.id}/locations`),
						fetch(`/api/campuses/${campus.id}/buildings`)
					]);

					const campusLocations = await locationsRes.json();
					const campusBuildings = await buildingsRes.json();

					if (campusLocations.success) {
						locations = [...locations, ...campusLocations.data.map((loc: Location) => ({ ...loc, campusName: campus.name, campusId: campus.id }))];
					}
					
					if (campusBuildings.success) {
						buildings = [...buildings, ...campusBuildings.data.map((bldg: Building) => ({ ...bldg, campusName: campus.name, campusId: campus.id }))];
					}
				}

				setAllLocations(locations);
				setAllBuildings(buildings);
			} catch (error) {
				console.error('Error fetching search data:', error);
			}
		};

		fetchData();
	}, []);

	const handleSearch = (query: string) => {
		setSearchQuery(query);

		if (!query.trim()) {
			setSearchResults([]);
			setShowSearchResults(false);
			return;
		}

		const lowerQuery = query.toLowerCase();

		// Search locations
		const locationResults: SearchResult[] = allLocations
			.filter(loc => 
				loc.name.toLowerCase().includes(lowerQuery) && 
				loc.latitude && 
				loc.longitude &&
				loc.category !== 'buildings' // Exclude building locations
			)
			.map(loc => ({
				id: loc.id,
				name: loc.name,
				type: 'location' as const,
				coordinates: {
					lat: parseFloat(loc.latitude!),
					lng: parseFloat(loc.longitude!)
				},
				campusName: (loc as any).campusName || '',
				campusId: (loc as any).campusId || 0,
				locationData: loc
			}));

		// Search buildings - need to find their location coordinates
		const buildingResults: SearchResult[] = allBuildings
			.filter(bldg => bldg.name.toLowerCase().includes(lowerQuery))
			.reduce<SearchResult[]>((acc, bldg) => {
				const location = allLocations.find(loc => loc.id === bldg.location_id);
				if (!location || !location.latitude || !location.longitude) {
					return acc;
				}
				acc.push({
					id: bldg.id,
					name: bldg.name,
					type: 'building' as const,
					coordinates: {
						lat: parseFloat(location.latitude),
						lng: parseFloat(location.longitude)
					},
					campusName: (bldg as any).campusName || '',
					campusId: (bldg as any).campusId || 0,
					buildingData: bldg
				});
				return acc;
			}, []);

		// Combine and sort results (buildings first, then alphabetically)
		const combined = [...buildingResults, ...locationResults].slice(0, 10);
		setSearchResults(combined);
		setShowSearchResults(true);
	};

	const handleSearchResultClick = (result: SearchResult) => {
		// Close search results
		setShowSearchResults(false);
		setSearchQuery(result.name);
		
		// Set the selected result to pan map and show info card (right side)
		setSelectedSearchResult(result);

		// Don't open the building panel automatically - let BuildingInfoCard handle it
		// The BuildingInfoCard has a "View Details" button that will open the panel
	};

	// Close search results when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.closest('.search-container')) {
				setShowSearchResults(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div className="h-screen w-screen flex flex-col">
			<header className="bg-transparent text-background p-2 sm:p-4 px-3 sm:px-6 z-50 flex items-center gap-2 sm:gap-4 justify-between absolute top-0 left-0 w-full">
				<Image
					src={uscLogo}
					alt="USC Logo"
					className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer flex-shrink-0"
				/>
				<div className="relative search-container flex-1 max-w-md">
					<div className="bg-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-[0px_1px_4px_rgba(0,0,0,0.3)]">
						<input
							type="text"
							placeholder="Search USC Virtual Tour"
							className="bg-transparent outline-none w-full text-black text-sm sm:text-base"
							value={searchQuery}
							onChange={(e) => handleSearch(e.target.value)}
							onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
						/>
					</div>
					
					{/* Search Results Dropdown */}
					{showSearchResults && searchResults.length > 0 && (
						<div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50 border border-gray-200">
							{searchResults.map((result, index) => (
								<div
									key={`${result.type}-${result.id}`}
								onClick={() => handleSearchResultClick(result)}
								className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
							>
								<div className="flex items-start justify-between">
									<div className="flex items-start gap-2">
										<Image 
											src={result.type === 'building' ? buildingIcon : locationIcon} 
											alt="" 
											width={16} 
											height={16} 
											className="mt-1"
										/>
										<div>
											<p className="font-semibold text-gray-900">{result.name}</p>
											<p className="text-xs text-gray-500 mt-1">
												{result.type === 'building' ? 'Building' : 'Location'} • {result.campusName}
											</p>
										</div>
									</div>
								</div>
							</div>
							))}
						</div>
					)}
				</div>
				<ProfileMenu mapType={mapType} onMapTypeChange={setMapType} />
			</header>
			<main className="flex-1 relative">
				<GoogleMap
					activeFilters={activeFilters}
					selectedEventId={selectedEventId}
					onEventSelect={setSelectedEventId}
					onBuildingSelect={setSelectedBuilding}
					searchResult={selectedSearchResult}
					mapType={mapType}
					onClearSearchResult={() => setSelectedSearchResult(null)}
				/>
				<Sidebar onFilterChange={setActiveFilters} />
				{activeFilters.events && (
					<EventsPanel onEventClick={setSelectedEventId} />
				)}
				<BuildingPanel
					building={selectedBuilding}
					onClose={() => setSelectedBuilding(null)}
				/>
			</main>
		</div>
	);
}
