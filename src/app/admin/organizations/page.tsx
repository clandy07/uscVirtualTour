'use client';

import { useState } from 'react';
import { Organization } from '@/app/types';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([
    { id: 1, logo: '', is_student_org: true },
    { id: 2, logo: '', is_student_org: false },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    logo: '',
    is_student_org: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = () => {
    setEditingOrg(null);
    setFormData({ logo: '', is_student_org: true });
    setIsModalOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      logo: org.logo || '',
      is_student_org: org.is_student_org || false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      setOrganizations(organizations.filter((o) => o.id !== id));
      // TODO: Call API to delete
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrg) {
      setOrganizations(
        organizations.map((o) =>
          o.id === editingOrg.id ? { ...o, ...formData } : o
        )
      );
    } else {
      const newOrg: Organization = {
        id: Math.max(0, ...organizations.map((o) => o.id)) + 1,
        ...formData,
      };
      setOrganizations([...organizations, newOrg]);
    }
    // TODO: Call API to create/update
    setIsModalOpen(false);
  };

  const filteredOrgs = organizations.filter((org) =>
    org.id.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Organizations</h2>
          <p className="mt-2 text-gray-900">Manage campus organizations</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium cursor-pointer"
        >
          + Add Organization
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search organizations..."
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
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Logo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrgs.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{org.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      org.is_student_org
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {org.is_student_org ? 'Student Org' : 'Official'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {org.logo ? (
                      <a href={org.logo} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">
                        View
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(org)}
                    className="text-green-700 hover:text-green-900 mr-4 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(org.id)}
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
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingOrg ? 'Edit Organization' : 'Add Organization'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_student_org"
                    checked={formData.is_student_org}
                    onChange={(e) => setFormData({ ...formData, is_student_org: e.target.checked })}
                    className="h-4 w-4 text-green-700 focus:ring-green-700 border-gray-300 rounded"
                  />
                  <label htmlFor="is_student_org" className="ml-2 block text-sm text-gray-900">
                    Student Organization
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium cursor-pointer"
                  >
                    {editingOrg ? 'Update' : 'Create'}
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
