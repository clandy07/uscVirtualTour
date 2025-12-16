'use client';

import { useState, useEffect } from 'react';
import { Organization } from '@/types';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([
    // { id: 1, name: 'USC Supreme Student Council', description: 'Main governing body of students', logo: '', is_student_org: true },
    // { id: 2, name: 'USC Alumni Association', description: 'Official alumni organization', logo: '', is_student_org: false },
  ]);
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await fetch('/api/orgs', {
          method: 'GET',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch organizations');
        }

        const {data} = await res.json();
        
        if(data.length > 0){
          const orgs = data.map((org: {
            id: number,
            name: string,
            description: string | null,
            logo: string | null,
            is_student_org: boolean
          }) => ({
            id: org.id,
            name: org.name,
            description: org.description,
            logo: org.logo,
            is_student_org: org.is_student_org
          }))
          setOrganizations(orgs);
        }        
      } catch (err) {
        console.error(err);
      } 
    };

    fetchOrgs();
  }, []); // empty dependency → run once on mount


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    is_student_org: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = () => {
    setEditingOrg(null);
    setFormData({ name: '', description: '', logo: '', is_student_org: true });
    setIsModalOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name || '',
      description: org.description || '',
      logo: org.logo || '',
      is_student_org: org.is_student_org || false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      try{
        const res = await fetch(`/api/orgs/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch organizations');
        }        
        
        const {data} = await res.json()
        if(data.length > 0) {
          setOrganizations(organizations.filter((o) => o.id !== id));
        }
      }
      catch(error){
        console.error(error)
      }
      
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrg) {
      try {
        const res = await fetch(`/api/orgs/${editingOrg.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            logo: formData.logo,
            is_student_org: formData.is_student_org
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to fetch organizations');
        }

        const {data} = await res.json();
        
        // if(data.length > 0){
        //   const orgs = data.map((org: {
        //     id: number,
        //     name: string,
        //     description: string | null,
        //     logo: string | null,
        //     is_student_org: boolean
        //   }) => ({
        //     id: org.id,
        //     name: org.name
        //   }))
        //   // setOrganizations([...organizations, {
        //   //   id: orgs[0].id,
        //   //   name: orgs[0].name,
        //   //   description: orgs[0].description,
        //   //   logo: orgs[0].logo,
        //   //   is_student_org: orgs[0].is_student_org
        //   // }]);
        // }        
        if(data.length > 0) setOrganizations(
          organizations.map((o) =>
            o.id === editingOrg.id ? { ...o, ...formData } : o
          )
        );
      } catch (err) {
        console.error(err);
      } 

    } else {
      const newOrg: Organization = {
        id: Math.max(0, ...organizations.map((o) => o.id)) + 1,
        ...formData,
      };
      console.log("new org: ", newOrg)
      try {
        const res = await fetch('/api/orgs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newOrg),
        });

        if (!res.ok) {
          throw new Error('Failed to fetch organizations');
        }

        const {data} = await res.json();
        
        if(data.length > 0){
          const orgs = data.map((org: {
            insertedOrgId: number,
            name: string,
            description: string | null,
            logo: string | null,
            is_student_org: boolean
          }) => ({
            id: org.insertedOrgId,
            name: org.name,
            description: org.description,
            logo: org.logo,
            is_student_org: org.is_student_org
          }))
          setOrganizations([...organizations, {
            id: orgs[0].id,
            name: orgs[0].name,
            description: orgs[0].description,
            logo: orgs[0].logo,
            is_student_org: orgs[0].is_student_org
          }]);
        }        
      } catch (err) {
        console.error(err);
      } 

      //setOrganizations([...organizations, newOrg]);
    }
    // TODO: Call API to create/update
    setIsModalOpen(false);
  };

  const filteredOrgs = organizations.filter((org) =>
    org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.id.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Organizations</h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-900">Manage campus organizations</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold cursor-pointer whitespace-nowrap"
        >
          + Add Organization
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 sm:gap-4">
        <input
          type="text"
          placeholder="Search organizations..."
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
                ID
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Name
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider hidden sm:table-cell">
                Description
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Type
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Logo
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrgs.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{org.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">{org.name}</div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <div className="text-sm text-gray-700 max-w-xs truncate">{org.description || 'N/A'}</div>
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
                    className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(org.id)}
                    className="text-red-600 hover:text-red-900 cursor-pointer font-bold"
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                {editingOrg ? 'Edit Organization' : 'Add Organization'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                    placeholder="Organization name"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black resize-none"
                    placeholder="Brief description of the organization"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
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
                  <label htmlFor="is_student_org" className="ml-2 block text-xs sm:text-sm text-gray-900">
                    Student Organization
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold cursor-pointer"
                  >
                    {editingOrg ? 'Update' : 'Create'}
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
