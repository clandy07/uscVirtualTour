'use client';

import Link from 'next/link';

const stats = [
  { name: 'Total Buildings', value: '42', change: '+2 this month', icon: '🏢' },
  { name: 'Active Events', value: '28', change: '+5 this week', icon: '📅' },
  { name: 'Organizations', value: '15', change: '+1 this month', icon: '👥' },
  { name: 'Total Users', value: '1,234', change: '+43 this week', icon: '👤' },
];

const quickActions = [
  { name: 'Add Building', href: '/admin/buildings', icon: '🏢' },
  { name: 'Create Event', href: '/admin/events', icon: '📅' },
  { name: 'Add Location', href: '/admin/locations', icon: '📍' },
  { name: 'Add Organization', href: '/admin/organizations', icon: '👥' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-gray-900">Welcome to the USC Virtual Tour Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-xs text-gray-900 mt-2">{stat.change}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-green-700 hover:shadow-md transition-all"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="font-medium text-gray-900">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
          <div className="p-4 flex items-start gap-4">
            <span className="text-2xl">🏢</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New building added</p>
              <p className="text-xs text-gray-900 mt-1">Science Building was added to the campus map</p>
              <p className="text-xs text-gray-900 mt-1">2 hours ago</p>
            </div>
          </div>
          <div className="p-4 flex items-start gap-4">
            <span className="text-2xl">📅</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Event updated</p>
              <p className="text-xs text-gray-900 mt-1">Campus Tour event details were modified</p>
              <p className="text-xs text-gray-900 mt-1">5 hours ago</p>
            </div>
          </div>
          <div className="p-4 flex items-start gap-4">
            <span className="text-2xl">👥</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New organization registered</p>
              <p className="text-xs text-gray-900 mt-1">USC Computer Science Club joined the platform</p>
              <p className="text-xs text-gray-900 mt-1">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
