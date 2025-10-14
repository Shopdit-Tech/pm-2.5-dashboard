import { SensorData } from '@/types/sensor';
import {
  TimeRange,
  TimeSeriesDataPoint,
  ChartData,
  getTimeRangeHours,
  getAggregationInterval,
  getIntervalMinutes,
} from '../types/chartTypes';

/**
 * Generate time-series data for a sensor parameter
 */
export function generateChartData(
  sensor: SensorData,
  parameter: keyof Pick<SensorData, 'temperature' | 'humidity' | 'co2' | 'pm1' | 'pm25' | 'pm10' | 'tvoc'>,
  timeRange: TimeRange
): ChartData {
  // Get current value, default to 0 if undefined
  const currentValue = (sensor[parameter] as number) || 0;
  
  // If value is 0 or invalid, generate reasonable defaults based on parameter
  let fallbackValue = currentValue;
  if (currentValue === 0 || !currentValue) {
    switch (parameter) {
      case 'pm1':
        fallbackValue = 15;
        break;
      case 'pm25':
        fallbackValue = 25;
        break;
      case 'pm10':
        fallbackValue = 40;
        break;
      case 'co2':
        fallbackValue = 500;
        break;
      case 'temperature':
        fallbackValue = 28;
        break;
      case 'humidity':
        fallbackValue = 65;
        break;
      case 'tvoc':
        fallbackValue = 300;
        break;
    }
  }
  
  const hours = getTimeRangeHours(timeRange);
  const interval = getAggregationInterval(timeRange);
  const intervalMinutes = getIntervalMinutes(interval);
  
  const totalPoints = Math.floor((hours * 60) / intervalMinutes);
  const now = Date.now();
  const data: TimeSeriesDataPoint[] = [];
  
  // Base value (use 85% of current as historical average)
  const baseValue = fallbackValue * 0.85;
  
  for (let i = 0; i < totalPoints; i++) {
    const timestamp = new Date(now - (totalPoints - i) * intervalMinutes * 60 * 1000);
    const hourOfDay = timestamp.getHours();
    
    // Daily pattern varies by parameter
    let dailyFactor = 1.0;
    
    if (parameter === 'pm1' || parameter === 'pm25' || parameter === 'pm10') {
      // PM levels: higher during rush hours (7-9am, 5-7pm), lower at night
      if ((hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 17 && hourOfDay <= 19)) {
        dailyFactor = 1.3 + Math.random() * 0.3;
      } else if (hourOfDay >= 22 || hourOfDay <= 5) {
        dailyFactor = 0.6 + Math.random() * 0.2;
      } else {
        dailyFactor = 0.9 + Math.random() * 0.3;
      }
    } else if (parameter === 'co2') {
      // CO2: higher when people are active
      if (hourOfDay >= 9 && hourOfDay <= 17) {
        dailyFactor = 1.2 + Math.random() * 0.2;
      } else if (hourOfDay >= 22 || hourOfDay <= 6) {
        dailyFactor = 0.7 + Math.random() * 0.2;
      } else {
        dailyFactor = 0.9 + Math.random() * 0.3;
      }
    } else if (parameter === 'temperature') {
      // Temperature: sinusoidal pattern
      const tempFactor = Math.sin(((hourOfDay - 6) / 24) * Math.PI * 2) * 0.3;
      dailyFactor = 1.0 + tempFactor;
    } else if (parameter === 'humidity') {
      // Humidity: inverse of temperature
      const humidityFactor = Math.sin(((hourOfDay - 18) / 24) * Math.PI * 2) * 0.25;
      dailyFactor = 1.0 + humidityFactor;
    } else {
      dailyFactor = 0.85 + Math.random() * 0.3;
    }
    
    // Add noise
    const noise = (Math.random() - 0.5) * 0.25;
    
    // Occasional spikes (1% chance)
    const spike = Math.random() < 0.01 ? 1.4 + Math.random() * 0.3 : 1.0;
    
    let value = baseValue * dailyFactor * (1 + noise) * spike;
    value = Math.max(0, value);
    
    // Round based on parameter
    if (parameter === 'co2' || parameter === 'tvoc') {
      value = Math.round(value);
    } else {
      value = Math.round(value * 10) / 10;
    }
    
    data.push({
      timestamp: timestamp.toISOString(),
      value,
      formattedTime: timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      formattedDate: timestamp.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    });
  }
  
  // Calculate statistics
  const values = data.map((d) => d.value);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  return {
    sensorId: sensor.id,
    sensorName: sensor.name,
    parameter,
    data,
    average,
    min,
    max,
  };
}

/**
 * Aggregate data points for bar charts
 */
export function aggregateDataPoints(
  data: TimeSeriesDataPoint[],
  bucketCount: number = 24
): TimeSeriesDataPoint[] {
  if (data.length <= bucketCount) {
    return data;
  }
  
  const bucketSize = Math.ceil(data.length / bucketCount);
  const aggregated: TimeSeriesDataPoint[] = [];
  
  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, i + bucketSize);
    const avgValue = bucket.reduce((sum, point) => sum + point.value, 0) / bucket.length;
    
    // Use the timestamp from the middle of the bucket
    const midPoint = bucket[Math.floor(bucket.length / 2)];
    
    aggregated.push({
      timestamp: midPoint.timestamp,
      value: Math.round(avgValue * 10) / 10,
      formattedTime: midPoint.formattedTime,
      formattedDate: midPoint.formattedDate,
    });
  }
  
  return aggregated;
}

/**
 * Get all available sensors (static + mobile)
 */
export function getAllSensors(staticSensors: SensorData[], mobileSensors: SensorData[]): SensorData[] {
  return [...staticSensors, ...mobileSensors];
}

/**
 * Get sensor by ID
 */
export function getSensorById(sensors: SensorData[], id: string): SensorData | undefined {
  return sensors.find((s) => s.id === id);
}

/**
 * Color palette for multi-location charts
 */
export const LOCATION_COLORS = [
  '#1890ff', // Blue
  '#52c41a', // Green
  '#fa8c16', // Orange
  '#722ed1', // Purple
  '#eb2f96', // Magenta
  '#13c2c2', // Cyan
  '#faad14', // Gold
  '#f5222d', // Red
  '#2f54eb', // Geek Blue
  '#a0d911', // Lime
];

/**
 * Get color for a sensor index
 */
export function getLocationColor(index: number): string {
  return LOCATION_COLORS[index % LOCATION_COLORS.length];
}
