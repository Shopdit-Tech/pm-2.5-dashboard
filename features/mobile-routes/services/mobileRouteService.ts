import { SensorData } from '@/types/sensor';
import { MobileRoute, RoutePoint } from '@/types/route';
import { getMobileSensors } from '@/services/sensorApi';
import { mapApiSensorsToAppSensors } from '@/utils/sensorMapper';
import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/lib/api/config';

export const mobileRouteService = {
  // Get all mobile sensors (movable=true)
  getMobileSensors: async (): Promise<SensorData[]> => {
    try {
      console.log('🚗 Fetching mobile sensors from real API...');
      
      // Call real API with movable=true
      const response = await getMobileSensors();
      
      // Map API response to app format
      const sensors = mapApiSensorsToAppSensors(response.items);
      
      console.log(`✅ Successfully fetched ${sensors.length} mobile sensors`);
      return sensors;
    } catch (error) {
      console.error('❌ Error fetching mobile sensors:', error);
      
      // Return empty array on error to prevent app crash
      return [];
    }
  },

  // Get mobile sensor by ID
  getMobileSensorById: async (id: string): Promise<SensorData | null> => {
    try {
      const allSensors = await mobileRouteService.getMobileSensors();
      const sensor = allSensors.find((s) => s.id === id);
      
      return sensor || null;
    } catch (error) {
      console.error(`❌ Error fetching mobile sensor ${id}:`, error);
      return null;
    }
  },

  // Get mobile sensor by code
  getMobileSensorByCode: async (code: string): Promise<SensorData | null> => {
    try {
      const allSensors = await mobileRouteService.getMobileSensors();
      const sensor = allSensors.find((s) => s.code === code);
      
      return sensor || null;
    } catch (error) {
      console.error(`❌ Error fetching mobile sensor ${code}:`, error);
      return null;
    }
  },

  /**
   * Get historical route for a mobile sensor on a specific date
   * @param sensor - Mobile sensor data
   * @param date - Date in YYYY-MM-DD format
   * @returns MobileRoute with all points for that day
   */
  getSensorRoute: async (sensor: SensorData, date: string): Promise<MobileRoute | null> => {
    try {
      if (!sensor.code) {
        console.warn('⚠️ Sensor has no code, cannot fetch route');
        return null;
      }

      console.log(`🗺️ Fetching route for ${sensor.name} on ${date}...`);

      // Calculate since_hours for the date
      // Get data for 24 hours from start of selected date
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const now = new Date();
      const hoursSince = Math.ceil((now.getTime() - selectedDate.getTime()) / (1000 * 60 * 60));

      // Call history API with All metrics and 1-minute aggregation for GPS accuracy
      const response = await axios.get(`${API_CONFIG.baseURL}${API_ENDPOINTS.sensorHistory}`, {
        params: {
          sensor_code: sensor.code,
          metric: 'All', // Get all parameters
          since_hours: Math.min(hoursSince + 24, 8760), // Max 1 year
          agg_minutes: 1, // 1-minute intervals for route accuracy
        },
        timeout: API_CONFIG.timeout,
      });

      const apiData = response.data;

      // Validate response
      if (!apiData.metrics || apiData.metrics.length === 0) {
        console.log('❌ No route data available for this date');
        return null;
      }

      // Transform API response to route points
      // Note: This assumes the API returns GPS coordinates in the response
      // If your API doesn't include lat/lng, you'll need to update the Supabase function
      const routePoints: RoutePoint[] = [];
      
      // Get first metric to use as base for iteration
      const baseMetric = apiData.metrics[0];
      if (!baseMetric.points || baseMetric.points.length === 0) {
        console.log('❌ No data points in response');
        return null;
      }

      // Filter points to only include those from the selected date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Create a map of timestamp -> values for each metric
      const metricsByTimestamp: Record<string, any> = {};
      
      apiData.metrics.forEach((metricData: any) => {
        metricData.points.forEach((point: any) => {
          const timestamp = point.ts || point.timestamp || point.time;
          const pointDate = new Date(timestamp);
          
          // Only include points from selected date
          if (pointDate >= startOfDay && pointDate <= endOfDay) {
            if (!metricsByTimestamp[timestamp]) {
              metricsByTimestamp[timestamp] = {
                timestamp,
                // GPS coordinates - IMPORTANT: Your API must return these
                latitude: point.latitude || point.lat || null,
                longitude: point.longitude || point.lng || point.lon || null,
              };
            }
            
            // Add metric value
            const metricName = metricData.metric.toLowerCase();
            metricsByTimestamp[timestamp][metricName] = point.value;
          }
        });
      });

      // Convert to array and sort by timestamp
      const timestamps = Object.keys(metricsByTimestamp).sort();
      
      timestamps.forEach((timestamp, index) => {
        const data = metricsByTimestamp[timestamp];
        
        // Skip points without valid GPS coordinates
        if (!data.latitude || !data.longitude) {
          return;
        }

        routePoints.push({
          id: `point-${index}`,
          latitude: data.latitude,
          longitude: data.longitude,
          pm25: data.pm25 || data.pm2_5 || 0,
          pm10: data.pm10 || 0,
          temperature: data.temperature || data.temperature_c || 0,
          humidity: data.humidity || 0,
          co2: data.co2 || 0,
          tvoc: data.tvoc || 0,
          timestamp: timestamp,
          speed: data.speed || undefined,
        });
      });

      if (routePoints.length === 0) {
        const totalPoints = timestamps.length;
        if (totalPoints > 0) {
          console.error('❌ API returned data but NO GPS coordinates (latitude/longitude)');
          throw new Error(
            `API returned ${totalPoints} data points but none have GPS coordinates. ` +
            `Your Supabase function must include 'latitude' and 'longitude' fields in the response.`
          );
        }
        console.log('❌ No data points found for this date');
        return null;
      }

      // Calculate route statistics
      const pm25Values = routePoints.map(p => p.pm25).filter(v => v > 0);
      const averagePm25 = pm25Values.length > 0
        ? pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length
        : 0;
      const maxPm25 = pm25Values.length > 0 ? Math.max(...pm25Values) : 0;
      const minPm25 = pm25Values.length > 0 ? Math.min(...pm25Values) : 0;

      // Calculate total distance (approximate)
      let totalDistance = 0;
      for (let i = 1; i < routePoints.length; i++) {
        const dist = calculateDistance(
          routePoints[i - 1].latitude,
          routePoints[i - 1].longitude,
          routePoints[i].latitude,
          routePoints[i].longitude
        );
        totalDistance += dist;
      }

      const route: MobileRoute = {
        id: `route-${sensor.code}-${date}`,
        deviceId: sensor.id,
        deviceName: sensor.name,
        startTime: routePoints[0].timestamp,
        endTime: routePoints[routePoints.length - 1].timestamp,
        totalDistance: Number(totalDistance.toFixed(2)),
        averagePm25: Number(averagePm25.toFixed(1)),
        maxPm25: Number(maxPm25.toFixed(1)),
        minPm25: Number(minPm25.toFixed(1)),
        points: routePoints,
      };

      console.log(`✅ Successfully loaded route with ${routePoints.length} points`);
      return route;
    } catch (error: any) {
      console.error('❌ Error fetching sensor route:', error.message);
      return null;
    }
  },
};

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @returns Distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
