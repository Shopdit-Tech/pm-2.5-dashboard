import type { ApiSensorReading, ApiMetricData } from '@/types/api';
import type { SensorData, SensorType, ParameterType } from '@/types/sensor';

/**
 * Generate friendly sensor name from code
 * @param code - Sensor code like "airgradient:744dbdbfdaac"
 * @param locationName - Optional location name
 */
const generateSensorName = (code: string, locationName: string | null): string => {
  if (locationName) {
    return locationName;
  }
  
  // Extract last part of code for display
  const parts = code.split(':');
  const shortCode = parts[parts.length - 1]?.substring(0, 6) || code;
  return `Sensor ${shortCode.toUpperCase()}`;
};

/**
 * Determine sensor type from API data
 * @param isMovable - Whether sensor is movable
 * @param locationName - Optional location name
 */
const determineSensorType = (isMovable: boolean, locationName: string | null): SensorType => {
  if (isMovable) {
    return 'mobile';
  }
  
  // Check location name for indoor/outdoor keywords
  const name = locationName?.toLowerCase() || '';
  if (name.includes('indoor') || name.includes('ในอาคาร')) {
    return 'indoor';
  }
  
  return 'outdoor';
};

/**
 * Determine sensor status based on last update time
 * @param timestamp - ISO 8601 timestamp
 */
const determineSensorStatus = (timestamp: string): 'online' | 'offline' => {
  const lastUpdate = new Date(timestamp).getTime();
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  return (now - lastUpdate) < fiveMinutes ? 'online' : 'offline';
};

/**
 * Map API sensor reading to app SensorData type
 * @param apiSensor - API sensor reading
 */
export const mapApiSensorToAppSensor = (apiSensor: ApiSensorReading): SensorData => {
  return {
    id: apiSensor.sensor_id,
    code: apiSensor.code, // Keep for API calls
    name: apiSensor.name, // Use name directly from API
    type: determineSensorType(apiSensor.is_movable, apiSensor.name),
    latitude: apiSensor.lat,
    longitude: apiSensor.lng,
    status: apiSensor.is_online ? 'online' : 'offline', // Use is_online from API
    timestamp: apiSensor.ts,
    lastUpdate: apiSensor.ts,
    // Sensor readings mapped directly
    pm1: apiSensor.pm1,
    pm25: apiSensor.pm25,
    pm10: apiSensor.pm10,
    co2: apiSensor.co2_ppm,
    temperature: apiSensor.temperature_c,
    humidity: apiSensor.humidity_rh,
    tvoc: apiSensor.tvoc_ppb,
    // Metadata
    model: apiSensor.model,
    channel: apiSensor.channel,
  };
};

/**
 * Map array of API sensors to app sensors
 */
export const mapApiSensorsToAppSensors = (apiSensors: ApiSensorReading[]): SensorData[] => {
  return apiSensors.map(mapApiSensorToAppSensor);
};

/**
 * Map API metric name to app parameter type
 */
export const mapApiMetricToParameter = (metric: string): ParameterType => {
  const mapping: Record<string, ParameterType> = {
    'pm1': 'pm1',
    'pm25': 'pm25',
    'pm10': 'pm10',
    'co2_ppm': 'co2',
    'temperature_c': 'temperature',
    'humidity_rh': 'humidity',
    'tvoc_ppb': 'tvoc',
  };
  
  return (mapping[metric] as ParameterType) || 'pm25';
};

/**
 * Map app parameter to API metric name
 */
export const mapParameterToApiMetric = (parameter: ParameterType): string => {
  const mapping: Record<ParameterType, string> = {
    'pm1': 'pm1',
    'pm25': 'pm25',
    'pm10': 'pm10',
    'co2': 'co2_ppm',
    'temperature': 'temperature_c',
    'humidity': 'humidity_rh',
    'tvoc': 'tvoc_ppb',
  };
  
  return mapping[parameter] || parameter;
};

/**
 * Map API history points to chart data
 */
export const mapApiHistoryToChartData = (
  metricData: ApiMetricData
): { timestamp: string; value: number }[] => {
  return metricData.points
    .filter((point) => point.value !== null)
    .map((point) => ({
      timestamp: point.ts,
      value: point.value!,
    }));
};

/**
 * Map time range string to hours
 */
export const mapTimeRangeToHours = (timeRange: string): number => {
  const mapping: Record<string, number> = {
    '1h': 1,
    '8h': 8,
    '24h': 24,
    '48h': 48,
    '7d': 168, // 7 * 24
    '30d': 720, // 30 * 24
  };
  
  return mapping[timeRange] || 24;
};
