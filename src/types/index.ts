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