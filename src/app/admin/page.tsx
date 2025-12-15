'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { buildingIcon, eventsIcon, organizationsIcon, userIcon, locationIcon } from '@/app/lib/icons';

interface DashboardStats {
  buildings: number;
  events: number;
  organizations: number;
  users: number;
  locations: number;
  campuses: number;
}

const quickActions = [
  { name: 'Add Building', href: '/admin/buildings', icon: buildingIcon },
  { name: 'Create Event', href: '/admin/events', icon: eventsIcon },
  { name: 'Add Location', href: '/admin/locations', icon: locationIcon },
  { name: 'Add Organization', href: '/admin/organizations', icon: organizationsIcon },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    buildings: 0,
    events: 0,
    organizations: 0,
    users: 0,
    locations: 0,
    campuses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch all counts in parallel
        const [campusesRes, buildingsRes, locationsRes, eventsRes] = await Promise.all([
          fetch('/api/campuses'),
          fetch('/api/campuses').then(async (res) => {
            const data = await res.json();
            if (!data.success || !data.data.length) return { data: [] };
            // Fetch buildings for all campuses
            const buildingsPromises = data.data.map((campus: any) =>
              fetch(`/api/campuses/${campus.id}/buildings`).then(r => r.json())
            );
            const buildingsResults = await Promise.all(buildingsPromises);
            return { data: buildingsResults.flatMap(r => r.success ? r.data : []) };
          }),
          fetch('/api/campuses').then(async (res) => {
            const data = await res.json();
            if (!data.success || !data.data.length) return { data: [] };
            // Fetch locations for all campuses
            const locationsPromises = data.data.map((campus: any) =>
              fetch(`/api/campuses/${campus.id}/locations`).then(r => r.json())
            );
            const locationsResults = await Promise.all(locationsPromises);
            return { data: locationsResults.flatMap(r => r.success ? r.data : []) };
          }),
          fetch('/api/eventGrps'),
        ]);

        const campusesData = await campusesRes.json();
        const eventsData = await eventsRes.json();

        setStats({
          campuses: campusesData.success ? campusesData.data.length : 0,
          buildings: buildingsRes.data.length,
          locations: locationsRes.data.length,
          events: eventsData.success ? eventsData.data.length : 0,
          organizations: 0, // TODO: Add organizations API endpoint
          users: 0, // TODO: Add users API endpoint
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Campuses', value: stats.campuses, icon: locationIcon },
    { name: 'Total Buildings', value: stats.buildings, icon: buildingIcon },
    { name: 'Total Locations', value: stats.locations, icon: locationIcon },
    { name: 'Active Events', value: stats.events, icon: eventsIcon },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-900">Welcome to the USC Virtual Tour Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">{
        statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900">{stat.name}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {isLoading ? '...' : stat.value}
                </p>
              </div>
              <Image src={stat.icon} alt="" width={32} height={32} className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">{
          quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:border-green-700 hover:shadow-md transition-all"
            >
              <Image src={action.icon} alt="" width={20} height={20} className="flex-shrink-0" />
              <span className="font-bold text-sm sm:text-base text-gray-900">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
