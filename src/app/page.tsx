"use client";

import { useState } from "react";
import GoogleMap from "./components/Map/GoogleMap";
import Sidebar from "./components/Sidebar/Sidebar";
import EventsPanel from "./components/Events/EventsPanel";
import BuildingPanel from "./components/Buildings/BuildingPanel";
import Image from "next/image";
import { CategoryFilter } from "./types";
import { Building } from "@/types";

import { uscLogo, profileIcon }  from "../app/lib/icons";

export default function Home() {
	const [activeFilters, setActiveFilters] = useState<CategoryFilter>({
		building: true,
		events: false,
		food: true,
		facilities: false,
		transport: false,
		study: true,
		dorms: false,
		sports: true,
	});
	const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
	const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
		null
	);

	return (
		<div className="h-screen w-screen flex flex-col">
			<header className="bg-transparent text-background p-4 px-6 z-50 flex items-center gap-4 justify-between absolute top-0 left-0 w-full">
				<Image
					src={uscLogo}
					alt="USC Logo"
					className="w-10 h-10 cursor-pointer md:w-15 md:h-15"
				/>
				<div className="bg-white rounded-full px-4 py-2 shadow-[0px_1px_4px_rgba(0,0,0,0.3)]">
					<input
						type="text"
						placeholder="Search USC Virtual Tour"
						className="bg-transparent outline-none w-200"
					/>
				</div>
				<div className="bg-gray-400 rounded-full p-1">
					<Image
						src={profileIcon}
						alt="Profile Icon"
						className="w-8 h-8 cursor-pointer brightness-0 invert"
					/>
				</div>
			</header>
			<main className="flex-1 relative">
				<GoogleMap
					activeFilters={activeFilters}
					selectedEventId={selectedEventId}
					onEventSelect={setSelectedEventId}
					onBuildingSelect={setSelectedBuilding}
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
