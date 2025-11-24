'use client';

import { useState } from 'react';
// import AdminMapPicker from '@/app/components/Map/AdminMapPicker';
import { Building } from '@/app/types';

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([
    { id: 1, name: 'Science Building', campus_id: 1, location_id: 1, floor_count: 5, basement_count: 1 },
    { id: 2, name: 'Engineering Hall', campus_id: 1, location_id: 2, floor_count: 4, basement_count: 0 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    campus_id: 0,
    location_id: 0,
    floor_count: 0,
    basement_count: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = () => {
    setEditingBuilding(null);
    setFormData({ name: '', campus_id: 0, location_id: 0, floor_count: 0, basement_count: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (building: Building) => {
    setEditingBuilding(building);
    setFormData({
      name: building.name,
      campus_id: building.campus_id,
      location_id: building.location_id,
      floor_count: building.floor_count || 0,
      basement_count: building.basement_count || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this building?')) {
      setBuildings(buildings.filter((b) => b.id !== id));
      // TODO: Call API to delete
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBuilding) {
      setBuildings(
        buildings.map((b) =>
          b.id === editingBuilding.id ? { ...b, ...formData } : b
        )
      );
    } else {
      const newBuilding: Building = {
        id: Math.max(0, ...buildings.map((b) => b.id)) + 1,
        ...formData,
      };
      setBuildings([...buildings, newBuilding]);
    }
    // TODO: Call API to create/update
    setIsModalOpen(false);
  };

  const filteredBuildings = buildings.filter((building) =>
    building.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Buildings</h2>
          <p className="mt-2 text-gray-900">Manage campus buildings</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium cursor-pointer"
        >
          + Add Building
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search buildings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
        />
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
                Campus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Floors
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Basements
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBuildings.map((building) => (
              <tr key={building.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{building.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Campus {building.campus_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{building.floor_count || 0}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{building.basement_count || 0}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(building)}
                    className="text-green-700 hover:text-green-900 mr-4 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(building.id)}
                    className="text-red-600 hover:text-red-900 cursor-pointer"
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
                {editingBuilding ? 'Edit Building' : 'Add Building'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Building Name *
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
                    Campus ID *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.campus_id}
                    onChange={(e) => setFormData({ ...formData, campus_id: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Location ID *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.location_id}
                    onChange={(e) => setFormData({ ...formData, location_id: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Floor Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.floor_count}
                      onChange={(e) => setFormData({ ...formData, floor_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Basement Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.basement_count}
                      onChange={(e) => setFormData({ ...formData, basement_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium cursor-pointer"
                  >
                    {editingBuilding ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
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
