// Real API Response Types from Supabase

export type ApiSensorReading = {
  sensor_id: string;
  code: string;
  name: string; // Sensor display name from API
  model: string;
  is_movable: boolean;
  is_online: boolean;
  ts: string; // ISO 8601 timestamp
  lat: number;
  lng: number;
  pm1: number | null;
  pm25: number;
  pm10: number;
  particle_0p3: number | null;
  co2_ppm: number | null;
  temperature_c: number;
  humidity_rh: number;
  tvoc_ppb: number | null;
  tvoc_index: number | null;
  nox_index: number | null;
  tvoc_raw_logr: number | null;
  nox_raw_logr: number | null;
  channel: string;
  type: string; // INDOOR, OUTDOOR, MOBILE
  location_id: string | null;
  location_name: string | null;
  address: string | null;
  fixed_lat: number | null;
  fixed_lng: number | null;
  last_seen: string;
  created_at: string;
  meta: Record<string, any> | null;
};

export type ApiSensorsLatestResponse = {
  count: number;
  items: ApiSensorReading[];
};

export type ApiHistoryPoint = {
  ts: string; // ISO 8601 timestamp
  value: number | null;
};

export type ApiMetricData = {
  metric: string;
  average: number;
  points_count: number;
  points: ApiHistoryPoint[];
};

export type ApiSensorHistoryResponse = {
  sensor_code: string;
  since_hours: number;
  agg_minutes: number;
  metrics: ApiMetricData[];
};

// Query parameters for API calls
export type SensorHistoryParams = {
  sensor_code: string;
  metric: 'All' | 'pm1' | 'pm25' | 'pm10' | 'co2_ppm' | 'temperature_c' | 'humidity_rh' | 'tvoc_ppb';
  since_hours?: number;
  agg_minutes: number;
  from?: string; // ISO 8601 date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
  to?: string;   // ISO 8601 date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
};
