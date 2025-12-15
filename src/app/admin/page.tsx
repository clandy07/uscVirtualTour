'use client';

import Link from 'next/link';
import Image from 'next/image';
import { buildingIcon, eventsIcon, organizationsIcon, userIcon, locationIcon } from '@/app/lib/icons';

const stats = [
  { name: 'Total Buildings', value: '42', change: '+2 this month', icon: buildingIcon },
  { name: 'Active Events', value: '28', change: '+5 this week', icon: eventsIcon },
  { name: 'Organizations', value: '15', change: '+1 this month', icon: organizationsIcon },
  { name: 'Total Users', value: '1,234', change: '+43 this week', icon: userIcon },
];

const quickActions = [
  { name: 'Add Building', href: '/admin/buildings', icon: buildingIcon },
  { name: 'Create Event', href: '/admin/events', icon: eventsIcon },
  { name: 'Add Location', href: '/admin/locations', icon: locationIcon },
  { name: 'Add Organization', href: '/admin/organizations', icon: organizationsIcon },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-900">Welcome to the USC Virtual Tour Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">{
        stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900">{stat.name}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stat.value}</p>
                <p className="text-xs text-gray-900 mt-1 sm:mt-2">{stat.change}</p>
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

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Recent Activity</h3>
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
          <div className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
            <Image src={buildingIcon} alt="" width={20} height={20} className="mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">New building added</p>
              <p className="text-xs text-gray-900 mt-1">Science Building was added to the campus map</p>
              <p className="text-xs text-gray-900 mt-1">2 hours ago</p>
            </div>
          </div>
          <div className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
            <Image src={eventsIcon} alt="" width={20} height={20} className="mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Event updated</p>
              <p className="text-xs text-gray-900 mt-1">Campus Tour event details were modified</p>
              <p className="text-xs text-gray-900 mt-1">5 hours ago</p>
            </div>
          </div>
          <div className="p-4 flex items-start gap-4">
            <Image src={organizationsIcon} alt="" width={24} height={24} className="mt-1" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">New organization registered</p>
              <p className="text-xs text-gray-900 mt-1">USC Computer Science Club joined the platform</p>
              <p className="text-xs text-gray-900 mt-1">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
