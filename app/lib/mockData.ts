export interface Location {
  id: number;
  name: string;
  category: 'academic' | 'food' | 'sports' | 'facilities' | 'transport' | 'study' | 'dorms';
  description?: string;
  geometry_id: number;
  campus_id: number;
  coordinates: { lat: number; lng: number };
}

export interface Building {
  id: number;
  name: string;
  campus_id: number;
  floor_array?: number[];
  location_id: number;
}

export interface Event {
  id: number;
  theme: string;
  description: string;
  date_time_start: string;
  date_time_end: string;
  custom_marker?: string;
  event_group_id?: number;
  org_id?: number;
  visibility: 'public' | 'private';
  location_id: number;
}

// Mock USC Talamban Campus Locations
export const MOCK_LOCATIONS: Location[] = [
  // Academic Buildings
  {
    id: 1,
    name: 'Bunzel Building',
    category: 'academic',
    description: 'Main academic building with classrooms and faculty offices',
    geometry_id: 1,
    campus_id: 1,
    coordinates: { lat: 10.3530, lng: 123.9122 },
  },
  {
    id: 2,
    name: 'SMED Building',
    category: 'academic',
    description: 'Science laboratories and technology classrooms',
    geometry_id: 2,
    campus_id: 1,
    coordinates: { lat: 10.3535, lng: 123.9125 },
  },
  {
    id: 3,
    name: 'SAFAD Buidling',
    category: 'academic',
    description: 'USC School of Arts, Fine Arts, and Design',
    geometry_id: 3,
    campus_id: 1,
    coordinates: { lat: 10.3528, lng: 123.9118 },
  },
  {
    id: 4,
    name: 'Library',
    category: 'study',
    description: 'Learning Resource Center',
    geometry_id: 4,
    campus_id: 1,
    coordinates: { lat: 10.3533, lng: 123.9115 },
  },
  
  // Food
  {
    id: 5,
    name: 'Bunzel Canteen',
    category: 'food',
    description: 'University cafeteria',
    geometry_id: 5,
    campus_id: 1,
    coordinates: { lat: 10.3532, lng: 123.9120 },
  },
  {
    id: 6,
    name: 'SAFAD Canteen',
    category: 'food',
    description: 'Student food stalls and vendors',
    geometry_id: 6,
    campus_id: 1,
    coordinates: { lat: 10.3527, lng: 123.9124 },
  },
  {
    id: 7,
    name: 'Cafe',
    category: 'food',
    description: 'Coffee shop and snacks',
    geometry_id: 7,
    campus_id: 1,
    coordinates: { lat: 10.3531, lng: 123.9119 },
  },

  // Sports/Recreation
  {
    id: 8,
    name: 'BCT',
    category: 'sports',
    description: 'Main sports facility and indoor courts',
    geometry_id: 8,
    campus_id: 1,
    coordinates: { lat: 10.3525, lng: 123.9115 },
  },
  {
    id: 9,
    name: 'Stadium',
    category: 'sports',
    description: 'Outdoor fields and courts',
    geometry_id: 9,
    campus_id: 1,
    coordinates: { lat: 10.3540, lng: 123.9130 },
  },
  {
    id: 10,
    name: 'Swimming Pool',
    category: 'sports',
    description: 'Olympic-size swimming pool (katong pond sa canteen dapit)',
    geometry_id: 10,
    campus_id: 1,
    coordinates: { lat: 10.3526, lng: 123.9128 },
  },

  // Facilities
  {
    id: 11,
    name: 'USC-TC Registrar',
    category: 'facilities',
    description: 'Administrative offices and services',
    geometry_id: 11,
    campus_id: 1,
    coordinates: { lat: 10.3534, lng: 123.9119 },
  },
  {
    id: 12,
    name: 'Security Office',
    category: 'facilities',
    description: 'Campus security and assistance',
    geometry_id: 12,
    campus_id: 1,
    coordinates: { lat: 10.3529, lng: 123.9121 },
  },

  // Transport/Parking
  {
    id: 13,
    name: 'Bunzel Parking Area',
    category: 'transport',
    description: 'Primary parking facility',
    geometry_id: 13,
    campus_id: 1,
    coordinates: { lat: 10.3523, lng: 123.9117 },
  },
  {
    id: 14,
    name: 'Gate 3',
    category: 'transport',
    description: 'Main entrance',
    geometry_id: 14,
    campus_id: 1,
    coordinates: { lat: 10.3520, lng: 123.9120 },
  },

  // Dorms/Residences
  {
    id: 15,
    name: 'USC Girls Dormitory',
    category: 'dorms',
    description: 'On-campus housing',
    geometry_id: 15,
    campus_id: 1,
    coordinates: { lat: 10.3538, lng: 123.9116 },
  },
];

export const MOCK_BUILDINGS: Building[] = [
  { id: 1, name: 'Bunzel Building', campus_id: 1, floor_array: [1, 2, 3, 4], location_id: 1 },
  { id: 2, name: 'SMED Building', campus_id: 1, floor_array: [1, 2, 3], location_id: 2 },
  { id: 3, name: 'SAFAD Building', campus_id: 1, floor_array: [1, 2, 3, 4, 5], location_id: 3 },
  { id: 4, name: 'Learning Resource Center', campus_id: 1, floor_array: [1, 2, 3, 4, 5], location_id: 4 },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    theme: 'Tech Conference 2025',
    description: 'Annual technology and innovation conference',
    date_time_start: '2025-11-15T09:00:00',
    date_time_end: '2025-11-15T17:00:00',
    visibility: 'public',
    location_id: 2,
    org_id: 1,
  },
  {
    id: 2,
    theme: 'SAS 3x3 Basketball Tournament',
    description: 'SAS Inter-department basketball championship',
    date_time_start: '2025-11-12T14:00:00',
    date_time_end: '2025-11-12T18:00:00',
    visibility: 'public',
    location_id: 8,
    org_id: 2,
  },
  {
    id: 3,
    theme: 'USC Days',
    description: 'USC Days WOOHOO',
    date_time_start: '2025-11-20T10:00:00',
    date_time_end: '2025-11-20T20:00:00',
    visibility: 'public',
    location_id: 12,
    org_id: 3,
  },
];