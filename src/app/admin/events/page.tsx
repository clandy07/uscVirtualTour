'use client';

import { useEffect, useState } from 'react';
// import AdminMapPicker from '@/app/components/Map/AdminMapPicker';
import { Event, Organization, Location } from '@/types';

// Add this helper function at the top of your component
const formatDateTimeLocal = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Format to YYYY-MM-DDTHH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function datetimeLocalToUTC(value: string) {
  // value: "2025-09-21T14:30"
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid datetime-local value");
  }

  const returnDate = date.toISOString()
  console.log(returnDate)
  return returnDate; // UTC, safe for timestamptz
}


export default function EventsPage() {
  const [campuses, setCampuses] = useState<{
    created_at: Date;
    updated_at: Date | null;
    id: number;
    name: string;
    address: string | null; 
  }[]>([]);

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const res = await fetch('/api/campuses', {
          method: "GET"
        });
        if (!res.ok) throw new Error('Failed to fetch campuses');

        const json = await res.json();
        if (json.success) {
          setCampuses(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch campuses', err);
      }
    };

    fetchCampuses();
  }, []);

  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (campuses.length === 0) return;

    const fetchAllLocations = async () => {
      try {
        const locationRequests = campuses.map((campus) =>
          fetch(`/api/campuses/${campus.id}/locations`, {
            method: "GET"
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error(`Failed to fetch locations for campus ${campus.id}`);
              }
              return res.json();
            })
            .then((json) => json.success ? json.data : [])
        );

        // Wait for all campuses
        const locationsByCampus = await Promise.all(locationRequests);

        // Compile into a single array
        const compiledLocations = locationsByCampus.flat();

        setLocations(compiledLocations);
      } catch (err) {
        console.error('Failed to fetch locations', err);
      }
    };
    console.log(campuses)
    fetchAllLocations();
  }, [campuses]);


  const [events, setEvents] = useState<Event[]>([
    // {
    //   id: 1,
    //   name: 'Campus Tour',
    //   description: 'Guided tour of the main campus',
    //   date_time_start: '2024-12-01T10:00',
    //   date_time_end: '2024-12-01T12:00',
    //   org_id: 1,
    //   visibility: 'everyone',
    //   location_id: 9
    // },
    // {
    //   id: 3,
    //   name: 'Donation drive',
    //   description: 'Donating in cash and in kind for the victims of bagyong Tinio',
    //   date_time_start: '2024-12-01T10:00',
    //   date_time_end: '2024-12-01T12:00',
    //   org_id: 3,
    //   visibility: 'everyone',
    // },
  ]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/events`, {
          method: "GET"
        })

        if (!res.ok) throw new Error('Failed to fetch events');

        const json = await res.json();
        if (json.data.length > 0) {
          setEvents(json.data);
          console.log(json.data)
        }

      } catch (err) {
        console.error('Failed to fetch events', err);
      }
    };
    console.log(locations)
    fetchEvents();
  }, []);

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const adminOrgs = organizations.filter(org => !org.is_student_org);
  
  

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await fetch('/api/orgs', {
          method: "GET"
        });
        if (!res.ok) throw new Error('Failed to fetch organizations');
        
        const json = await res.json();
        if (json.data.length > 0) {
          setOrganizations(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch organizations', err);
      }
    };
    fetchOrgs();
  }, []);

  

  // // Mock organizations data - in real app, fetch from API
  // const [organizations] = useState([
  //   { id: 1, name: 'USC Alumni Association', is_student_org: false },
  //   { id: 2, name: 'USC Administration', is_student_org: false },
  //   { id: 3, name: 'Supreme Student Council', is_student_org: true }, // Should not appear
  //   { id: 4, name: 'Athletics Department', is_student_org: false },
  //   { id: 5, name: 'Computer Science Society', is_student_org: true }, // Should not appear
  // ]);

  useEffect(() => {
    console.log(events)
  }, [events])

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date_time_start: '',
    date_time_end: '',
    custom_marker: '',
    event_group_id: 0,
    org_id: 0,
    visibility: 'everyone' as 'everyone' | 'only_students' | 'only_organization_members',
    location_id: 0
  });
  const [searchQuery, setSearchQuery] = useState('');

  // useEffect(() => {
  //   console.log(formData)
  // }, [formData])

  const handleAdd = () => {
    setEditingEvent(null);
    setFormData({
      name: '',
      description: '',
      date_time_start: '',
      date_time_end: '',
      custom_marker: '',
      event_group_id: 0,
      org_id: 0,
      visibility: 'everyone',
      location_id: 0
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    console.log(formData)
  }, [formData])

  const [prevFormData, setPrevFormData] = useState({
    name: '',
    description: '',
    date_time_start: '',
    date_time_end: '',
    custom_marker: '',
    event_group_id: 0,
    org_id: 0,
    visibility: 'everyone' as 'everyone' | 'only_students' | 'only_organization_members',
    location_id: 0
  });

  const handleEdit = (event: Event) => {
    setEditingEvent(event);

    const data = {
      name: event.name,
      description: event.description || '',
      date_time_start: event.date_time_start,
      date_time_end: event.date_time_end,
      custom_marker: event.custom_marker || '',
      event_group_id: event.event_group_id || 0,
      org_id: event.org_id || 0,
      visibility: event.visibility || 'everyone',
      location_id: event.location_id
    }
    setFormData(data);
    setPrevFormData(data)
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter((e) => e.id !== id));
      // TODO: Call API to delete
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEvent) {
      // UPDATE (edit existing event)
      console.log("prev data: ", prevFormData)
      console.log("new data: ", formData)
      try {
        const res = await fetch(
          `/api/orgs/${prevFormData.org_id}/events/${editingEvent.id}?oldLocationId=${prevFormData.location_id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name, 
              description: formData.description,
              dateTimeStart: datetimeLocalToUTC(formData.date_time_start),
              dateTimeEnd: datetimeLocalToUTC(formData.date_time_end),
              visibility: formData.visibility,
              evetGroupId: formData.event_group_id == 0 ? null : formData.event_group_id,
              customMarker: formData.custom_marker,
              locationId: formData.location_id,
              org_id: formData.org_id
            }),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to update event");
        }

        const json = await res.json();
        const {data} = json
        console.log("after updating: ", data)
        
        const updatedEvent = {
          id: data.eventIdUpdated,
          name: formData.name,
          description: formData.description,
          date_time_start: formData.date_time_start,
          date_time_end: formData.date_time_end,
          custom_marker: formData.custom_marker,
          event_group_id: formData.event_group_id,
          org_id: formData.org_id,
          visibility: formData.visibility,
          location_id: data.newLocationId
        }
        // Update local state after successful API call
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === editingEvent.id ? { ...ev, ...updatedEvent } : ev
          )
        );
      } catch (error) {
        console.error("Error updating event:", error);
      }
    } else {
      // CREATE (add new event)
      const newEventPayload = {
        name: formData.name,
        description: formData.description,
        dateTimeStart: datetimeLocalToUTC(formData.date_time_start),
        dateTimeEnd: datetimeLocalToUTC(formData.date_time_end),
        customMarker: formData.custom_marker,
        eventGroupId: formData.event_group_id,
        org_id: formData.org_id,
        visibility: formData.visibility,
        locationId: formData.location_id
      };
      console.log(newEventPayload)
      try {
        const res = await fetch(`/api/orgs/${formData.org_id}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEventPayload),
        });

        if (!res.ok) {
          throw new Error("Failed to create event");
        }

        const json = await res.json();
        const {data} = json

        // Use the event returned by the backend (important!)
        if(data.length > 0) setEvents((prev) => [...prev, {
          id: data[0].insertedEventId,
          ...formData
        }]);

      } catch (error) {
        console.error("Error creating event:", error);
      }
    }
      setIsModalOpen(false);
  };

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Events</h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-900">Manage campus events</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold cursor-pointer whitespace-nowrap"
        >
          + Add Event
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 sm:gap-4">
        <input
          type="text"
          placeholder="Search events..."
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
                Event
              </th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Start Time
              </th>
              <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                End Time
              </th>
              <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Visibility
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900">{event.name}</div>
                  <div className="text-xs text-gray-900 truncate max-w-xs">{event.description}</div>
                </td>
                <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-gray-900">
                    {organizations.find(org => org.id === event.org_id)?.name || 'No Organization'}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-gray-900">
                    {new Date(event.date_time_start).toLocaleString()}
                  </div>
                </td>
                <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-gray-900">
                    {event.date_time_end ? new Date(event.date_time_end).toLocaleString() : 'N/A'}
                  </div>
                </td>
                <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {event.visibility}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-blue-600 hover:text-blue-900 mr-2 sm:mr-4 cursor-pointer font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-600 hover:text-red-900 cursor-pointer font-bold"
                  >
                    <span className="hidden sm:inline">Delete</span>
                    <span className="sm:hidden">Del</span>
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                {editingEvent ? 'Edit Event' : 'Add Event'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Event Name *
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
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Organization
                  </label>
                  <select
                    value={formData.org_id}
                    onChange={(e) => setFormData({ ...formData, org_id: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black cursor-pointer"
                  >
                    <option value={0}>No Organization</option>
                    {adminOrgs.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Only non-student organizations are available for admin posting
                  </p>
                </div>


                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Location
                  </label>
                  <select
                    value={formData.location_id}
                    onChange={(e) => setFormData({ ...formData, location_id: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black cursor-pointer"
                  >
                    <option value={0}>No location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  {/* <p className="text-xs text-gray-500 mt-1">
                    Only non-student organizations are available for admin posting
                  </p> */}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.date_time_start}
                      onChange={(e) => {
                        console.log("date_time_start: ", e.target.value)
                        setFormData({ ...formData, date_time_start: e.target.value })
                      }}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.date_time_end}
                      onChange={(e) => setFormData({ ...formData, date_time_end: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Visibility *
                  </label>
                  <select
                    required
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="only_students">Only Students</option>
                    <option value="only_organization_members">Only Organization Members</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold cursor-pointer"
                    onClick={(e) => handleSubmit(e)}
                  >
                    {editingEvent ? 'Update' : 'Create'}
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
