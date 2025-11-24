export interface Location {
  id: number;
  name: string;
  category?: 'buildings' | 'events' | 'food' | 'facilities' | 'transport_parking' | 'study_areas' | 'dorms_residences' | 'sports_recreation';
  description?: string;
  campus_id: number;
}

export interface Building {
  id: number;
  name: string;
  campus_id: number;
  location_id: number;
  basement_count?: number;
  floor_count?: number;
}

export interface Room {
  id: string;
  name: string;
  building_id: string;
  office_id?: string;
  geometry_id: string;
  description?: string;
  floor_index: number;
}

export interface Office {
  id: string;
  name: string;
  department_id: string;
  school_id: string;
}

export interface Organization {
  id: number;
  logo?: string;
  is_student_org?: boolean;
}

export interface Department {
  id: string;
  name: string;
  school_id: string;
}

export interface Event {
  id: number;
  name: string;
  description?: string;
  date_time_start: string;
  date_time_end?: string;
  custom_marker?: string;
  event_group_id?: number;
  org_id?: number;
  visibility?: 'everyone' | 'only_students' | 'only_organization_members';
}

export type CategoryFilter = {
  building: boolean;
  events: boolean;
  food: boolean;
  facilities: boolean;
  transport: boolean;
  study: boolean;
  dorms: boolean;
  sports: boolean;
};

export interface MapConfig {
  center: { lat: number; lng: number };
  zoom: number;
  apiKey: string;
}