'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  is_admin: boolean;
  email_verified: boolean;
  created_at: string;
  organizations?: string[]; // Organization names the user is a member of
}

// SUGGESTION: Nice unta if there was a loading gif shown while the users are being fetched


export default function AdminUsersPage() {
  // // Mock: Available organizations for assignment
  // const [availableOrganizations] = useState([
  //   { id: 1, name: 'Supreme Student Council' },
  //   { id: 2, name: 'Computer Science Society' },
  //   { id: 3, name: 'Carolinian Dance Troupe' },
  //   { id: 4, name: 'USC Alumni Association' },
  //   { id: 5, name: 'Athletics Department' },
  // ]);
  const [availableOrganizations, setAvailableOrganizations] = useState<{id: number, name: string}[]>([]);
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
            name: org.name
          }))
          setAvailableOrganizations(orgs);
        }        
      } catch (err) {
        console.error(err);
      } 
    };

    fetchOrgs();
  }, []); // empty dependency → run once on mount

  const [users, setUsers] = useState<User[]>([
    // {
    //   id: '1',
    //   name: 'Juan Dela Cruz',
    //   email: '21081234@usc.edu.ph',
    //   username: '21081234',
    //   is_admin: false,
    //   email_verified: true,
    //   created_at: '2024-01-15',
    //   organizations: ['Supreme Student Council', 'Computer Science Society'],
    // },
    // {
    //   id: '2',
    //   name: 'Maria Santos',
    //   email: '21655678@usc.edu.ph',
    //   username: '21655678',
    //   is_admin: false,
    //   email_verified: true,
    //   created_at: '2024-02-20',
    //   organizations: ['Supreme Student Council', 'Carolinian Dance Troupe'],
    // },
    // {
    //   id: '3',
    //   name: 'Admin User',
    //   email: 'admin@usc.edu.ph',
    //   username: 'admin-001',
    //   is_admin: true,
    //   email_verified: true,
    //   created_at: '2023-12-01',
    //   organizations: [],
    // },
  ]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', {
          method: 'GET',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }

        const {data} = await res.json();
        
        if (data.length === 0) return;

        const users = await Promise.all(
          data.map(async (user: {
            id: number;
            firstName: string;
            lastName: string;
            username: string;
            email: string;
          }) => {
            const res = await fetch(`/api/users/${user.id}`, {
              method: 'GET'
            });
            if (!res.ok) throw new Error('Failed to fetch user');


            const { data } = await res.json();

            const userOrgs: {
              user_id: string;
              org_id: number;
              can_post_events: boolean;
              can_add_members: boolean;
              can_remove_members: boolean;
              can_set_member_permissions: boolean;
              organization: {
                  id: number;
                  name: string;
                  created_at: Date;
                  description: string | null;
                  updated_at: Date | null;
                  logo: string | null;
                  is_student_org: boolean | null;
              };
            }[] = data.userOrgs

            let orgNames = (userOrgs.length > 0) 
              ? userOrgs.map((userOrg) => userOrg.organization.name)
              : [];
            
            return {
              id: data.id,
              name: `${data.first_name} ${data.mid_name} ${data.last_name}`,
              email: data.email,
              username: `${data.username}`,
              is_admin: data.is_admin,
              email_verified: data.email_verified,
              created_at: data.created_at,
              organizations: orgNames,
            };
          })
        );
        
        console.log(users)
        setUsers(users);
             
      } catch (err) {
        console.error(err);
      } 
    };

    fetchUsers();
  }, []); // empty dependency → run once on mount

  const [previousUserOrgs, setPreviousUserOrgs] = useState<string[]>([]);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
    if(user.organizations != undefined) setPreviousUserOrgs(user.organizations);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== userId));
      // TODO: Call API to delete user
    }
  };

  function getOrgMembershipUpdates(
    previousUserOrgs: string[], 
    currentUserOrgs: string[]
  ): {
    orgsKickedFrom: number[],
    orgsJoined: number[]
  } {
    const orgNameToId = new Map(
      availableOrganizations.map(org => [org.name, org.id])
    );

    const prevUsrOrgIds = previousUserOrgs
      .map(name => orgNameToId.get(name))
      .filter((id): id is number => id !== undefined);

    const currUsrOrgIds = currentUserOrgs
      .map(name => orgNameToId.get(name))
      .filter((id): id is number => id !== undefined);

    const prevSet = new Set(prevUsrOrgIds);
    const currSet = new Set(currUsrOrgIds);

    return {
      orgsKickedFrom: prevUsrOrgIds.filter(id => !currSet.has(id)),
      orgsJoined: currUsrOrgIds.filter(id => !prevSet.has(id)),
    };
  }


  const handleUpdateUser = async () => {
    if (editingUser) {
      // if(editingUser.organizations != undefined) 
      const {orgsKickedFrom, orgsJoined} = getOrgMembershipUpdates(
        previousUserOrgs, 
        editingUser.organizations || []
      );
      
      if (orgsKickedFrom.length > 0) {
        try{
          const retOrgsKickedId = await Promise.all(
            orgsKickedFrom.map((orgId) =>
              fetch(`/api/orgs/${orgId}/members/${editingUser.id}`, {
                method: 'DELETE',
              })
            )
          );

          console.log("orgs kicked from: ", retOrgsKickedId )
        }
        catch(error){
          console.error(error)
        }

      }


      if(orgsJoined.length > 0){
        // TODO: Call API to update user's org memberships
        try{
          const retOrgsJoinedId = await Promise.all(
            orgsJoined.map((orgId) =>
              fetch(`/api/orgs/${orgId}/members`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userIdToAdd: editingUser.id,
                  canPostEvents: false,
                  canAddMembers: false,
                  canRemoveMembers: false,
                  canSetMemberPermissions: false,
                }),
              })
            )
          );

          console.log("new orgs joined: ", retOrgsJoinedId )
        }
        catch(error){
          console.error(error)
        }

      }

      if(orgsKickedFrom.length > 0 || orgsJoined.length > 0) setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      
      setIsEditModalOpen(false);
      setEditingUser(null);
      
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Users</h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-900">Manage system users</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 sm:gap-4">
        <input
          type="text"
          placeholder="Search users..."
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
                User
              </th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Username
              </th>
              <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Role
              </th>
              <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Status
              </th>
              <th className="hidden xl:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Organizations
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-600">{user.email}</div>
                </td>
                <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-gray-900">{user.username}</div>
                </td>
                <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.is_admin 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.is_admin ? 'Admin' : 'Student'}
                  </span>
                </td>
                <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.email_verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.email_verified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="hidden xl:table-cell px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {user.organizations && user.organizations.length > 0 ? (
                      user.organizations.map((org, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                          {org}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No organizations</span>
                    )}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-2 sm:mr-4 cursor-pointer font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
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

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                Edit user {editingUser.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Organization Memberships
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {availableOrganizations.map((org) => (
                      <label key={org.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingUser.organizations?.includes(org.name) || false}
                          onChange={(e) => {
                            const currentOrgs = editingUser.organizations || [];
                            if (e.target.checked) {
                              setEditingUser({
                                ...editingUser,
                                organizations: [...currentOrgs, org.name]
                              });
                            } else {
                              setEditingUser({
                                ...editingUser,
                                organizations: currentOrgs.filter(o => o !== org.name)
                              });
                            }
                          }}
                          className="h-4 w-4 text-green-700 focus:ring-green-700 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">{org.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Select organizations this user should be a member of
                  </p>
                </div>

                {/* <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.is_admin}
                      onChange={(e) => setEditingUser({...editingUser, is_admin: e.target.checked})}
                      className="h-4 w-4 text-green-700 focus:ring-green-700 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">Admin Access</div>
                      <div className="text-xs text-gray-600">Grant administrator privileges</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.email_verified}
                      onChange={(e) => setEditingUser({...editingUser, email_verified: e.target.checked})}
                      className="h-4 w-4 text-green-700 focus:ring-green-700 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">Email Verified</div>
                      <div className="text-xs text-gray-600">Mark email as verified</div>
                    </div>
                  </label>
                </div> */}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-4 border-t">
                <button
                  onClick={handleUpdateUser}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold cursor-pointer"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
