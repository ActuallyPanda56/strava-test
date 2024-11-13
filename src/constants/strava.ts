interface Athlete {
  id: number;
  resource_state: number;
}

interface Maps {
  id: string;
  summary_polyline: string | null;
  resource_state: number;
}

export interface Activity {
  resource_state: number;
  athlete: Athlete;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  workout_type?: string | null;
  id: number;
  external_id: string;
  upload_id: number;
  upload_id_str: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  start_latlng: [number, number] | null | []; // can be null or an empty array
  end_latlng: [number, number] | null | []; // can be null or an empty array
  location_city: string | null; // can be null
  location_state: string | null; // can be null
  location_country: string | null; // can be null
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map: Maps;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  gear_id: string | null; // can be null
  from_accepted_tag: boolean;
  average_speed: number;
  max_speed: number;
  average_cadence?: number | null; // could be null
  average_watts?: number | null; // could be null
  weighted_average_watts?: number | null; // could be null
  kilojoules?: number | null; // could be null
  device_watts?: boolean;
  display_hide_heartrate_option: boolean;
  has_heartrate: boolean;
  average_heartrate?: number | null; // could be null
  max_heartrate?: number | null; // could be null
  max_watts?: number | null; // could be null
  pr_count: number;
  has_kudoed: boolean;
  suffer_score?: number;
  // additional fields from your example
  elev_high?: number | null; // can be undefined or null
  elev_low?: number | null; // can be undefined or null
  visibility?: string; // optional
  heartrate_opt_out?: boolean; // optional
  total_photo_count?: number; // optional
}
