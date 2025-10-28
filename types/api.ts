// Real API Response Types from Supabase

export type ApiSensorReading = {
  sensor_id: string;
  code: string;
  model: string;
  is_movable: boolean;
  ts: string; // ISO 8601 timestamp
  lat: number;
  lng: number;
  pm1: number;
  pm25: number;
  pm10: number;
  particle_0p3: number;
  co2_ppm: number;
  temperature_c: number;
  humidity_rh: number;
  tvoc_ppb: number;
  tvoc_index: number;
  nox_index: number;
  tvoc_raw_logr: number;
  nox_raw_logr: number;
  channel: string;
  location_id: string | null;
  location_name: string | null;
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
