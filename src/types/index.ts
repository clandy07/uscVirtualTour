export interface Location {
  id: number;
  name: string;
  category?: 'buildings' | 'events' | 'food' | 'facilities' | 'transport_parking' | 'study_areas' | 'dorms_residences' | 'sports_recreation';
  description?: string;
  campus_id: number;
  latitude?: string;
  longitude?: string;
  coordinates?: { lat: number; lng: number };
}

export interface FloorData {
  kmlUrl?: string;
  embedUrl?: string; 
  center: { lat: number; lng: number };
  zoom: number;
}

export interface Building {
  id: number;
  name: string;
  campus_id: number;
  location_id: number;
  floor_count?: number;
  basement_count?: number;
  floor_data?: {
    [floor: number]: FloorData;
  };
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

export type CategoryFilter = {
  buildings: boolean;
  events: boolean;
  food: boolean;
  facilities: boolean;
  transport_parking: boolean;
  study_areas: boolean;
  dorms_residences: boolean;
  sports_recreation: boolean;
};

export interface MapConfig {
  center: { lat: number; lng: number };
  zoom: number;
  apiKey: string;
}

export type UserRole = 'guest' | 'student' | 'admin';

export type authUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
  username: string;
  displayUsername?: string | null | undefined;
  last_name: string;
  is_student: boolean;
  is_admin: boolean;
  mid_name?: string | null | undefined;
};
