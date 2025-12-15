'use client';

import { useState, useEffect } from 'react';
// import AdminMapPicker from '@/app/components/Map/AdminMapPicker';
import { Building } from '@/types';
import Toast, { ToastType } from '@/app/components/Toast';

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [campuses, setCampuses] = useState<{ id: number; name: string }[]>([]);
  const [locations, setLocations] = useState<{ id: number; name: string; campus_id: number }[]>([]);
  const [selectedCampusId, setSelectedCampusId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    campus_id: 0,
    location_id: 0,
    floor_count: 0,
    basement_count: 0,
    total_rooms: 0,
    facilities: [] as string[],
    accessibility_features: [] as string[],
    fun_facts: [] as string[],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Fetch campuses on mount
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const response = await fetch('/api/campuses');
        const data = await response.json();
        if (data.success) {
          setCampuses(data.data);
          if (data.data.length > 0) {
            setSelectedCampusId(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching campuses:', error);
      }
    };
    fetchCampuses();
  }, []);

  // Fetch locations and buildings when campus changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCampusId) return;
      
      setIsLoading(true);
      try {
        // Fetch locations for the selected campus
        const locationsResponse = await fetch(`/api/campuses/${selectedCampusId}/locations`);
        const locationsData = await locationsResponse.json();
        if (locationsData.success) {
          setLocations(locationsData.data);
        }

        // Fetch buildings for the selected campus
        const buildingsResponse = await fetch(`/api/campuses/${selectedCampusId}/buildings`);
        const buildingsData = await buildingsResponse.json();
        if (buildingsData.success) {
          setBuildings(buildingsData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedCampusId]);

  const handleAdd = () => {
    setEditingBuilding(null);
    setFormData({ 
      name: '', 
      campus_id: selectedCampusId || 0, 
      location_id: 0, 
      floor_count: 0, 
      basement_count: 0,
      total_rooms: 0,
      facilities: [],
      accessibility_features: [],
      fun_facts: [],
    });
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
      total_rooms: building.total_rooms || 0,
      facilities: building.facilities || [],
      accessibility_features: building.accessibility_features || [],
      fun_facts: building.fun_facts || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this building and its associated location?')) return;
    if (!selectedCampusId) return;
    
    try {
      const response = await fetch(`/api/campuses/${selectedCampusId}/buildings/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBuildings(buildings.filter((b) => b.id !== id));
        setToast({ message: 'Building deleted successfully', type: 'success' });
      } else {
        setToast({ message: data.error || 'Failed to delete building', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting building:', error);
      setToast({ message: 'Failed to delete building', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampusId) return;
    
    try {
      const payload = {
        name: formData.name,
        floor_count: formData.floor_count,
        basement_count: formData.basement_count,
        total_rooms: formData.total_rooms || null,
        facilities: formData.facilities.length > 0 ? formData.facilities : null,
        accessibility_features: formData.accessibility_features.length > 0 ? formData.accessibility_features : null,
        fun_facts: formData.fun_facts.length > 0 ? formData.fun_facts : null,
      };
      
      if (editingBuilding) {
        // Update existing building
        const response = await fetch(`/api/campuses/${selectedCampusId}/buildings/${editingBuilding.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setBuildings(
            buildings.map((b) =>
              b.id === editingBuilding.id ? data.data.building : b
            )
          );
          setIsModalOpen(false);
          setToast({ message: 'Building updated successfully', type: 'success' });
        } else {
          setToast({ message: data.error || 'Failed to update building', type: 'error' });
        }
      } else {
        // Create new building
        const locationParam = formData.location_id ? `?locationId=${formData.location_id}` : '';
        const response = await fetch(`/api/campuses/${selectedCampusId}/buildings${locationParam}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setBuildings([...buildings, data.data.building]);
          setIsModalOpen(false);
          setToast({ message: 'Building created successfully', type: 'success' });
        } else {
          setToast({ message: data.error || 'Failed to create building', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Error saving building:', error);
      setToast({ message: 'Failed to save building', type: 'error' });
    }
  };

  const filteredBuildings = buildings.filter((building) =>
    building.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Buildings</h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-900">Manage campus buildings</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={!selectedCampusId}
          className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          + Add Building
        </button>
      </div>

      {/* Campus Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <label className="text-xs sm:text-sm font-semibold text-gray-900">Select Campus:</label>
        <select
          value={selectedCampusId || ''}
          onChange={(e) => setSelectedCampusId(parseInt(e.target.value))}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black cursor-pointer"
        >
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="flex gap-2 sm:gap-4">
        <input
          type="text"
          placeholder="Search buildings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Name
              </th>
              <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Campus
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Floors
              </th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Basements
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                  Loading buildings...
                </td>
              </tr>
            ) : filteredBuildings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                  No buildings found
                </td>
              </tr>
            ) : (
              filteredBuildings.map((building) => (
                <tr key={building.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">{building.name}</div>
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900">{campuses.find(c => c.id === building.campus_id)?.name || 'Unknown'}</div>
                  </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-gray-900">{building.floor_count || 0}</div>
                </td>
                <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-gray-900">{building.basement_count || 0}</div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <button
                    onClick={() => handleEdit(building)}
                    className="text-blue-600 hover:text-blue-900 mr-2 sm:mr-4 cursor-pointer font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(building.id)}
                    className="text-red-600 hover:text-red-900 cursor-pointer font-bold"
                  >
                    <span className="hidden sm:inline">Delete</span>
                    <span className="sm:hidden">Del</span>
                  </button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                {editingBuilding ? 'Edit Building' : 'Add Building'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
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
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Campus
                  </label>
                  <input
                    type="text"
                    value={campuses.find(c => c.id === formData.campus_id)?.name || 'Unknown'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Location (optional)
                  </label>
                  <select
                    value={formData.location_id || ''}
                    onChange={(e) => setFormData({ ...formData, location_id: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  >
                    <option value="">Create new location</option>
                    {locations
                      .filter(loc => loc.campus_id === formData.campus_id)
                      .filter(loc => !buildings.some(b => b.location_id === loc.id && b.id !== editingBuilding?.id))
                      .map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Select an existing location or leave empty to create a new one
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                      Floor Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.floor_count}
                      onChange={(e) => setFormData({ ...formData, floor_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                      Basement Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.basement_count}
                      onChange={(e) => setFormData({ ...formData, basement_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Total Rooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.total_rooms}
                    onChange={(e) => setFormData({ ...formData, total_rooms: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Facilities (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.facilities.join(', ')}
                    onChange={(e) => setFormData({ ...formData, facilities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="Elevators, Restrooms, Water Fountains, Cafeteria"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Accessibility Features (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.accessibility_features.join(', ')}
                    onChange={(e) => setFormData({ ...formData, accessibility_features: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="Wheelchair Ramp, Accessible Restrooms, Braille Signage"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Fun Facts (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.fun_facts.join('\n')}
                    onChange={(e) => setFormData({ ...formData, fun_facts: e.target.value.split('\n').filter(fact => fact.trim()) })}
                    placeholder="First LEED-certified building in USC&#10;Features a rooftop garden&#10;Houses the largest computer lab on campus"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold cursor-pointer"
                  >
                    {editingBuilding ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 font-bold cursor-pointer"
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
