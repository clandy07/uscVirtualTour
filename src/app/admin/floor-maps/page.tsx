'use client';

import { useState, useEffect } from 'react';
import { Building, FloorData } from '@/types';
import Toast, { ToastType } from '@/app/components/Toast';

export default function FloorMapsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [campuses, setCampuses] = useState<{ id: number; name: string }[]>([]);
  const [selectedCampusId, setSelectedCampusId] = useState<number | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    floor_number: 1,
    embedUrl: '',
    kmlUrl: '',
    center_lat: '',
    center_lng: '',
    zoom: 19,
  });
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

  // Fetch buildings when campus changes
  useEffect(() => {
    const fetchBuildings = async () => {
      if (!selectedCampusId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/campuses/${selectedCampusId}/buildings`);
        const data = await response.json();
        if (data.success) {
          setBuildings(data.data);
        }
      } catch (error) {
        console.error('Error fetching buildings:', error);
        showToast('Failed to fetch buildings', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuildings();
  }, [selectedCampusId]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const openAddModal = (floorNumber: number) => {
    setEditingFloor(floorNumber);
    const existingData = selectedBuilding?.floor_data?.[floorNumber];
    
    setFormData({
      floor_number: floorNumber,
      embedUrl: existingData?.embedUrl || '',
      kmlUrl: existingData?.kmlUrl || '',
      center_lat: existingData?.center?.lat?.toString() || '',
      center_lng: existingData?.center?.lng?.toString() || '',
      zoom: existingData?.zoom || 19,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFloor(null);
    setFormData({
      floor_number: 1,
      embedUrl: '',
      kmlUrl: '',
      center_lat: '',
      center_lng: '',
      zoom: 19,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBuilding || !selectedCampusId) return;

    // Validation
    if (!formData.embedUrl && !formData.kmlUrl) {
      showToast('Please provide either an Embed URL or KML URL', 'error');
      return;
    }

    if (!formData.center_lat || !formData.center_lng) {
      showToast('Please provide center coordinates', 'error');
      return;
    }

    try {
      const response = await fetch(
        `/api/campuses/${selectedCampusId}/buildings/${selectedBuilding.id}/floors`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            floor_number: formData.floor_number,
            embedUrl: formData.embedUrl || undefined,
            kmlUrl: formData.kmlUrl || undefined,
            center: {
              lat: parseFloat(formData.center_lat),
              lng: parseFloat(formData.center_lng),
            },
            zoom: formData.zoom,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        showToast(data.message || 'Floor data saved successfully', 'success');
        
        // Refresh building data
        const buildingsResponse = await fetch(`/api/campuses/${selectedCampusId}/buildings`);
        const buildingsData = await buildingsResponse.json();
        if (buildingsData.success) {
          setBuildings(buildingsData.data);
          const updatedBuilding = buildingsData.data.find((b: Building) => b.id === selectedBuilding.id);
          if (updatedBuilding) {
            setSelectedBuilding(updatedBuilding);
          }
        }
        
        closeModal();
      } else {
        showToast(data.error || 'Failed to save floor data', 'error');
      }
    } catch (error) {
      console.error('Error saving floor data:', error);
      showToast('Failed to save floor data', 'error');
    }
  };

  const handleDelete = async (floorNumber: number) => {
    if (!selectedBuilding || !selectedCampusId) return;
    
    if (!confirm(`Are you sure you want to delete floor ${floorNumber} data?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/campuses/${selectedCampusId}/buildings/${selectedBuilding.id}/floors?floor_number=${floorNumber}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        showToast(data.message || 'Floor data deleted successfully', 'success');
        
        // Refresh building data
        const buildingsResponse = await fetch(`/api/campuses/${selectedCampusId}/buildings`);
        const buildingsData = await buildingsResponse.json();
        if (buildingsData.success) {
          setBuildings(buildingsData.data);
          const updatedBuilding = buildingsData.data.find((b: Building) => b.id === selectedBuilding.id);
          if (updatedBuilding) {
            setSelectedBuilding(updatedBuilding);
          }
        }
      } else {
        showToast(data.error || 'Failed to delete floor data', 'error');
      }
    } catch (error) {
      console.error('Error deleting floor data:', error);
      showToast('Failed to delete floor data', 'error');
    }
  };

  // Generate floor array for selected building
  const getFloorNumbers = (building: Building): number[] => {
    const floors: number[] = [];
    if (building.basement_count && building.basement_count > 0) {
      for (let i = building.basement_count; i >= 1; i--) {
        floors.push(-i);
      }
    }
    if (building.floor_count && building.floor_count > 0) {
      for (let i = 1; i <= building.floor_count; i++) {
        floors.push(i);
      }
    }
    return floors;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Floor Maps Management</h1>
        <p className="text-gray-900">Add and manage floor maps for buildings</p>
      </div>

      {/* Campus Selector */}
      <div className="mb-6">
        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Select Campus</label>
        <select
          value={selectedCampusId || ''}
          onChange={(e) => {
            setSelectedCampusId(parseInt(e.target.value));
            setSelectedBuilding(null);
          }}
          className="w-full md:w-64 px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name}
            </option>
          ))}
        </select>
      </div>

      {/* Buildings Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Buildings List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg sm:text-xl text-gray-900 font-semibold mb-4">Buildings</h2>
            <div className="space-y-2">
              {buildings.map((building) => (
                <button
                  key={building.id}
                  onClick={() => setSelectedBuilding(building)}
                  className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer text-gray-900 ${
                    selectedBuilding?.id === building.id
                      ? 'bg-red-900 text-white border-red-900'
                      : 'bg-white border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="font-semibold">{building.name}</div>
                  <div className={`text-xs sm:text-sm ${selectedBuilding?.id === building.id ? 'text-red-100' : 'text-gray-900'}`}>
                    {building.floor_count || 0} floors
                    {building.basement_count ? `, ${building.basement_count} basement${building.basement_count > 1 ? 's' : ''}` : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Floor Maps Management */}
          <div className="lg:col-span-2">
            {selectedBuilding ? (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
                  Floor Maps for {selectedBuilding.name}
                </h2>
                <div className="bg-white rounded-lg shadow">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                            Floor
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                            Status
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                            Source
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-semibold text-gray-900 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFloorNumbers(selectedBuilding).map((floorNum) => {
                          const floorData = selectedBuilding.floor_data?.[floorNum];
                          const hasData = !!floorData;
                          
                          return (
                            <tr key={floorNum} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">
                                  {floorNum < 0 ? `Basement ${Math.abs(floorNum)}` : `Floor ${floorNum}`}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  hasData
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  {hasData ? 'Configured' : 'Not Set'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {floorData?.embedUrl && 'Google My Maps'}
                                {floorData?.kmlUrl && 'KML Layer'}
                                {!hasData && '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => openAddModal(floorNum)}
                                  className={`mr-4 font-bold cursor-pointer ${
                                    hasData 
                                      ? 'text-blue-600 hover:text-blue-900' 
                                      : 'text-green-600 hover:text-green-900'
                                  }`}
                                >
                                  {hasData ? 'Edit' : 'Add'}
                                </button>
                                {hasData && (
                                  <button
                                    onClick={() => handleDelete(floorNum)}
                                    className="text-red-600 hover:text-red-900 font-bold cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <p className="text-gray-900">Select a building to manage its floor maps</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-black">
                {editingFloor !== null && editingFloor < 0
                  ? `Basement ${Math.abs(editingFloor)}`
                  : `Floor ${editingFloor}`} Map Data
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                    Google My Maps Embed URL
                  </label>
                  <input
                    type="url"
                    value={formData.embedUrl}
                    onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder-gray-500"
                    placeholder="https://www.google.com/maps/d/embed?mid=..."
                  />
                  <p className="text-xs text-black mt-1">
                    Get this from Google My Maps → Share → Embed map
                  </p>
                </div>

                <div className="text-center text-black text-xs sm:text-sm font-medium">OR</div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                    KML File URL
                  </label>
                  <input
                    type="url"
                    value={formData.kmlUrl}
                    onChange={(e) => setFormData({ ...formData, kmlUrl: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder-gray-500"
                    placeholder="https://example.com/floor.kml"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                      Center Latitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.center_lat}
                      onChange={(e) => setFormData({ ...formData, center_lat: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder-gray-500"
                      placeholder="10.3521"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                      Center Longitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.center_lng}
                      onChange={(e) => setFormData({ ...formData, center_lng: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder-gray-500"
                      placeholder="123.9131"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1">
                    Zoom Level *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="22"
                    required
                    value={formData.zoom}
                    onChange={(e) => setFormData({ ...formData, zoom: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-900 mt-1">
                    Recommended: 19-21 for indoor maps
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-900 text-white px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg hover:bg-red-800 transition-colors font-bold"
                  >
                    Save Floor Data
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 text-gray-900 px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg hover:bg-gray-300 transition-colors font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
