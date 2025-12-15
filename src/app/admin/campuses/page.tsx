'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastType } from '@/app/components/Toast';

interface Campus {
  id: number;
  name: string;
  address: string;
}

export default function CampusesPage() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Fetch campuses on mount
  useEffect(() => {
    fetchCampuses();
  }, []);

  const fetchCampuses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/campuses');
      const data = await response.json();
      if (data.success) {
        setCampuses(data.data);
      }
    } catch (error) {
      console.error('Error fetching campuses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCampus(null);
    setFormData({ name: '', address: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (campus: Campus) => {
    setEditingCampus(campus);
    setFormData({
      name: campus.name,
      address: campus.address,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this campus? This will also delete all associated locations and buildings.')) return;
    
    try {
      const response = await fetch(`/api/campuses/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCampuses(campuses.filter((c) => c.id !== id));
        setToast({ message: 'Campus deleted successfully', type: 'success' });
      } else {
        setToast({ message: data.error || 'Failed to delete campus', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting campus:', error);
      setToast({ message: 'Failed to delete campus', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
      };
      
      if (editingCampus) {
        // Update existing campus
        const response = await fetch(`/api/campuses/${editingCampus.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setCampuses(
            campuses.map((c) =>
              c.id === editingCampus.id ? data.data : c
            )
          );
          setIsModalOpen(false);
          setToast({ message: 'Campus updated successfully', type: 'success' });
        } else {
          setToast({ message: data.error || 'Failed to update campus', type: 'error' });
        }
      } else {
        // Create new campus
        const response = await fetch('/api/campuses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setCampuses([...campuses, data.data]);
          setIsModalOpen(false);
          setToast({ message: 'Campus created successfully', type: 'success' });
        } else {
          setToast({ message: data.error || 'Failed to create campus', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Error saving campus:', error);
      setToast({ message: 'Failed to save campus', type: 'error' });
    }
  };

  const filteredCampuses = campuses.filter((campus) =>
    campus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campus.address.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Campuses</h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-900">Manage university campuses</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold cursor-pointer whitespace-nowrap"
        >
          + Add Campus
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 sm:gap-4">
        <input
          type="text"
          placeholder="Search campuses..."
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
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Address
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                  Loading campuses...
                </td>
              </tr>
            ) : filteredCampuses.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                  No campuses found
                </td>
              </tr>
            ) : (
              filteredCampuses.map((campus) => (
                <tr key={campus.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">{campus.name}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="text-xs sm:text-sm text-gray-900">{campus.address}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                    <button
                      onClick={() => handleEdit(campus)}
                      className="text-blue-600 hover:text-blue-900 mr-2 sm:mr-4 cursor-pointer font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(campus.id)}
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
                {editingCampus ? 'Edit Campus' : 'Add Campus'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                    Campus Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                    placeholder="e.g., Main Campus"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                    Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                    placeholder="e.g., Nasipit, Talamban, Cebu City, Cebu 6000"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold cursor-pointer"
                  >
                    {editingCampus ? 'Update' : 'Create'}
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
