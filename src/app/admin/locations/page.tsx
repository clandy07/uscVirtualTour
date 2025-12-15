'use client';

import { useState, useEffect } from 'react';
import AdminMapPicker from '@/app/components/Map/AdminMapPicker';
import { Location } from '@/types';
import Toast, { ToastType } from '@/app/components/Toast';

const categories: { value: Location['category']; label: string }[] = [
  { value: 'buildings', label: 'Buildings' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'transport_parking', label: 'Transport & Parking' },
  { value: 'study_areas', label: 'Study Areas' },
  { value: 'dorms_residences', label: 'Dorms & Residences' },
  { value: 'sports_recreation', label: 'Sports & Recreation' },
];

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [campuses, setCampuses] = useState<{ id: number; name: string }[]>([]);
  const [selectedCampusId, setSelectedCampusId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'buildings' as Location['category'],
    description: '',
    campus_id: 0,
    coordinates: null as { lat: number; lng: number } | null,
    operating_hours: '',
    contact_number: '',
    email: '',
    website_url: '',
    images: [] as string[],
    amenities: [] as string[],
    tags: [] as string[],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Location['category'] | 'all'>('all');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [latInput, setLatInput] = useState<string>('');
  const [lngInput, setLngInput] = useState<string>('');
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

  // Fetch locations when campus changes
  useEffect(() => {
    const fetchLocations = async () => {
      if (!selectedCampusId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/campuses/${selectedCampusId}/locations`);
        const data = await response.json();
        if (data.success) {
          setLocations(data.data);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocations();
  }, [selectedCampusId]);

  const handleAdd = () => {
    setEditingLocation(null);
    setFormData({ 
      name: '', 
      category: 'buildings', 
      description: '', 
      campus_id: selectedCampusId || 0, 
      coordinates: null,
      operating_hours: '',
      contact_number: '',
      email: '',
      website_url: '',
      images: [],
      amenities: [],
      tags: [],
    });
    setLatInput('');
    setLngInput('');
    setShowMapPicker(false);
    setIsModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    
    // Parse coordinates from latitude/longitude strings
    let coordinates = null;
    if ((location as any).latitude && (location as any).longitude) {
      coordinates = {
        lat: parseFloat((location as any).latitude),
        lng: parseFloat((location as any).longitude)
      };
    }
    
    setFormData({
      name: location.name,
      category: location.category || 'buildings',
      description: location.description || '',
      campus_id: location.campus_id,
      coordinates: coordinates,
      operating_hours: location.operating_hours || '',
      contact_number: location.contact_number || '',
      email: location.email || '',
      website_url: location.website_url || '',
      images: location.images || [],
      amenities: location.amenities || [],
      tags: location.tags || [],
    });
    setLatInput(coordinates?.lat ? String(coordinates.lat) : '');
    setLngInput(coordinates?.lng ? String(coordinates.lng) : '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this location and its associated building?')) return;
    if (!selectedCampusId) return;
    
    try {
      const response = await fetch(`/api/campuses/${selectedCampusId}/locations/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLocations(locations.filter((l) => l.id !== id));
        setToast({ message: 'Location deleted successfully', type: 'success' });
      } else {
        setToast({ message: data.error || 'Failed to delete location', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      setToast({ message: 'Failed to delete location', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampusId) return;
    
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        latitude: formData.coordinates?.lat.toString() || null,
        longitude: formData.coordinates?.lng.toString() || null,
        operating_hours: formData.operating_hours || null,
        contact_number: formData.contact_number || null,
        email: formData.email || null,
        website_url: formData.website_url || null,
        images: formData.images.length > 0 ? formData.images : null,
        amenities: formData.amenities.length > 0 ? formData.amenities : null,
        tags: formData.tags.length > 0 ? formData.tags : null,
      };
      
      if (editingLocation) {
        // Update existing location
        const response = await fetch(`/api/campuses/${selectedCampusId}/locations/${editingLocation.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setLocations(
            locations.map((l) =>
              l.id === editingLocation.id ? data.data.location : l
            )
          );
          setIsModalOpen(false);
          setToast({ message: 'Location updated successfully', type: 'success' });
        } else {
          setToast({ message: data.error || 'Failed to update location', type: 'error' });
        }
      } else {
        // Create new location
        const response = await fetch(`/api/campuses/${selectedCampusId}/locations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setLocations([...locations, data.data.location]);
          setIsModalOpen(false);
          setToast({ message: 'Location created successfully', type: 'success' });
        } else {
          setToast({ message: data.error || 'Failed to create location', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Error saving location:', error);
      setToast({ message: 'Failed to save location', type: 'error' });
    }
  };

  const getCategoryBadgeColor = (category: Location['category']) => {
    const colors: Record<NonNullable<Location['category']>, string> = {
      buildings: 'bg-red-100 text-red-800',
      events: 'bg-blue-100 text-blue-800',
      food: 'bg-orange-100 text-orange-800',
      facilities: 'bg-purple-100 text-purple-800',
      transport_parking: 'bg-gray-100 text-gray-800',
      study_areas: 'bg-yellow-100 text-yellow-800',
      dorms_residences: 'bg-pink-100 text-pink-800',
      sports_recreation: 'bg-green-100 text-green-800',
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Locations</h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-900">Manage campus locations</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={!selectedCampusId}
          className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          + Add Location
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

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as Location['category'] | 'all')}
          className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black cursor-pointer"
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
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Name
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Category
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider hidden sm:table-cell">
                Campus
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider hidden md:table-cell">
                Description
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Loading locations...
                </td>
              </tr>
            ) : filteredLocations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No locations found
                </td>
              </tr>
            ) : (
              filteredLocations.map((location) => (
                <tr key={location.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">{location.name}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadgeColor(location.category)}`}>
                      {categories.find((c) => c.value === location.category)?.label}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-xs sm:text-sm text-gray-900">{campuses.find(c => c.id === location.campus_id)?.name || 'Unknown'}</div>
                  </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                  <div className="text-xs sm:text-sm text-gray-900 truncate max-w-xs">
                    {location.description || 'No description'}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <button
                    onClick={() => handleEdit(location)}
                    className="text-blue-600 hover:text-blue-900 mr-2 sm:mr-4 cursor-pointer font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="text-red-600 hover:text-red-900 cursor-pointer font-bold"
                  >
                    Del
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                {editingLocation ? 'Edit Location' : 'Add Location'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Location['category'] })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
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
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={formData.operating_hours}
                    onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                    placeholder="e.g., Mon-Fri: 8AM-5PM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={formData.contact_number}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      placeholder="+63 32 123 4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="location@usc.edu.ph"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Image URLs (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.images.join('\n')}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value.split('\n').filter(url => url.trim()) })}
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Amenities (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.amenities.join(', ')}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="WiFi, Air Conditioning, Wheelchair Accessible"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="Popular, Student Favorite, New"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                {/* Coordinates (manual input or map picker) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Coordinates (optional)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Latitude"
                      value={latInput}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLatInput(v);
                        const lat = v === '' ? null : parseFloat(v);
                        const lng = lngInput === '' ? null : parseFloat(lngInput);
                        if (lat !== null && !isNaN(lat) && lng !== null && !isNaN(lng)) {
                          setFormData({ ...formData, coordinates: { lat, lng } });
                        } else {
                          setFormData({ ...formData, coordinates: null });
                        }
                      }}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                    />
                    <input
                      type="text"
                      placeholder="Longitude"
                      value={lngInput}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLngInput(v);
                        const lat = latInput === '' ? null : parseFloat(latInput);
                        const lng = v === '' ? null : parseFloat(v);
                        if (lat !== null && !isNaN(lat) && lng !== null && !isNaN(lng)) {
                          setFormData({ ...formData, coordinates: { lat, lng } });
                        } else {
                          setFormData({ ...formData, coordinates: null });
                        }
                      }}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                    />
                  </div>

                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(!showMapPicker)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold"
                    >
                      {showMapPicker ? 'Hide map' : 'Pick on map'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFormData({ ...formData, coordinates: null }); setLatInput(''); setLngInput(''); }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                    >
                      Clear coordinates
                    </button>
                  </div>

                  {showMapPicker && (
                    <div className="mt-3">
                      <AdminMapPicker
                        coordinates={formData.coordinates ?? undefined}
                        onCoordinatesSelect={(coords) => { setFormData({ ...formData, coordinates: coords }); setLatInput(String(coords.lat)); setLngInput(String(coords.lng)); }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold cursor-pointer text-sm sm:text-base"
                  >
                    {editingLocation ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 font-bold cursor-pointer text-sm sm:text-base"
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
