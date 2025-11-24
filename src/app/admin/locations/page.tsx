'use client';

import { useState } from 'react';
// import AdminMapPicker from '@/app/components/Map/AdminMapPicker';
import { Location } from '@/app/types';

const categories: { value: Location['category']; label: string }[] = [
  { value: 'buildings', label: 'Buildings' },
  { value: 'events', label: 'Events' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'transport_parking', label: 'Transport & Parking' },
  { value: 'study_areas', label: 'Study Areas' },
  { value: 'dorms_residences', label: 'Dorms & Residences' },
  { value: 'sports_recreation', label: 'Sports & Recreation' },
];

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([
    { id: 1, name: 'Student Center', category: 'buildings', description: '', campus_id: 1 },
    { id: 2, name: 'Campus Cafe', category: 'food', description: '', campus_id: 1 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'buildings' as Location['category'],
    description: '',
    campus_id: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Location['category'] | 'all'>('all');

  const handleAdd = () => {
    setEditingLocation(null);
    setFormData({ name: '', category: 'buildings', description: '', campus_id: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      category: location.category || 'buildings',
      description: location.description || '',
      campus_id: location.campus_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this location?')) {
      setLocations(locations.filter((l) => l.id !== id));
      // TODO: Call API to delete
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      setLocations(
        locations.map((l) =>
          l.id === editingLocation.id ? { ...l, ...formData } : l
        )
      );
    } else {
      const newLocation: Location = {
        id: Math.max(0, ...locations.map((l) => l.id)) + 1,
        ...formData,
      };
      setLocations([...locations, newLocation]);
    }
    // TODO: Call API to create/update
    setIsModalOpen(false);
  };

  const getCategoryBadgeColor = (category: Location['category']) => {
    const colors: Record<NonNullable<Location['category']>, string> = {
      buildings: 'bg-blue-100 text-blue-800',
      events: 'bg-purple-100 text-purple-800',
      food: 'bg-orange-100 text-orange-800',
      facilities: 'bg-gray-100 text-gray-800',
      transport_parking: 'bg-yellow-100 text-yellow-800',
      study_areas: 'bg-green-100 text-green-800',
      dorms_residences: 'bg-pink-100 text-pink-800',
      sports_recreation: 'bg-red-100 text-red-800',
    };
    return category ? colors[category] : 'bg-gray-100 text-gray-800';
  };

  const filteredLocations = locations.filter((location) => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || location.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Locations</h2>
          <p className="mt-2 text-gray-900">Manage campus locations</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium"
        >
          + Add Location
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as Location['category'] | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Campus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLocations.map((location) => (
              <tr key={location.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{location.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadgeColor(location.category)}`}>
                    {categories.find((c) => c.value === location.category)?.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Campus {location.campus_id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 truncate max-w-xs">
                    {location.description || 'No description'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(location)}
                    className="text-green-700 hover:text-green-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingLocation ? 'Edit Location' : 'Add Location'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Location['category'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Campus ID
                  </label>
                  <input
                    type="number"
                    value={formData.campus_id}
                    onChange={(e) => setFormData({ ...formData, campus_id: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium"
                  >
                    {editingLocation ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
