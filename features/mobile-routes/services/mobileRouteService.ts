import { SensorData } from '@/types/sensor';
import { MobileRoute, RoutePoint } from '@/types/route';
import { getMobileSensors } from '@/services/sensorApi';
import { mapApiSensorsToAppSensors } from '@/utils/sensorMapper';
import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/lib/api/config';

const formatTimestampForApi = (date: Date): string => {
  const isoString = date.toISOString();
  return isoString.replace(/\.\d{3}Z$/, 'Z');
};

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
   * Get historical route for a mobile sensor for a date/time range
   * @param sensor - Mobile sensor data
   * @param fromDateTime - Start datetime (ISO string or Date object in UTC+7)
   * @param toDateTime - End datetime (ISO string or Date object in UTC+7)
   * @returns MobileRoute with all points for that range
   */
  getSensorRouteRange: async (
    sensor: SensorData,
    fromDateTime: string | Date,
    toDateTime: string | Date
  ): Promise<MobileRoute | null> => {
    try {
      if (!sensor.code) {
        console.warn('⚠️ Sensor has no code, cannot fetch route');
        return null;
      }

      console.log(`🗺️ Fetching route for ${sensor.name} from ${fromDateTime} to ${toDateTime}...`);

      // Convert datetime to UTC for API
      // User selects datetime in UTC+7, API needs UTC
      const fromDate = new Date(fromDateTime);
      const toDate = new Date(toDateTime);
      
      const fromDateUTC = formatTimestampForApi(fromDate);
      const toDateUTC = formatTimestampForApi(toDate);
      
      console.log('🕐 Timezone conversion:', {
        fromUTC7: fromDateTime.toString(),
        toUTC7: toDateTime.toString(),
        fromUTC: fromDateUTC,
        toUTC: toDateUTC,
      });

      // Call history API with All metrics and 1-hour aggregation
      const response = await axios.get(`${API_CONFIG.baseURL}${API_ENDPOINTS.sensorHistory}`, {
        params: {
          sensor_code: sensor.code,
          metric: 'All',
          from: fromDateUTC,
          to: toDateUTC,
          agg_minutes: 60,
        },
        timeout: API_CONFIG.timeout,
      });

      const apiData = response.data;

      console.log('📊 API Response:', {
        metricsCount: apiData.metrics?.length,
        firstMetric: apiData.metrics?.[0]?.metric,
        firstPointSample: apiData.metrics?.[0]?.points?.[0],
      });

      // Validate response
      if (!apiData.metrics || apiData.metrics.length === 0) {
        console.log('❌ No route data available for this date range');
        return null;
      }

      // Transform API response to route points
      const routePoints: RoutePoint[] = [];
      
      const baseMetric = apiData.metrics[0];
      if (!baseMetric.points || baseMetric.points.length === 0) {
        console.log('❌ No data points in response');
        return null;
      }

      // Create a map of timestamp -> values for each metric
      const metricsByTimestamp: Record<string, any> = {};
      
      console.log('📊 Available metrics:', apiData.metrics.map((m: any) => m.metric));
      
      apiData.metrics.forEach((metricData: any) => {
        metricData.points.forEach((point: any) => {
          const timestamp = point.ts || point.timestamp || point.time;
          const pointDate = new Date(timestamp);
          
          // Include all points in the range
          if (pointDate >= fromDate && pointDate <= toDate) {
            if (!metricsByTimestamp[timestamp]) {
              metricsByTimestamp[timestamp] = {
                timestamp,
                lat: null,
                lng: null,
              };
            }
            
            // Extract lat/lng from point properties (not metric names)
            if (point.lat !== undefined && point.lat !== null) {
              metricsByTimestamp[timestamp].lat = point.lat;
            }
            if (point.lng !== undefined && point.lng !== null) {
              metricsByTimestamp[timestamp].lng = point.lng;
            }
            
            // Map metric value
            const metricName = metricData.metric;
            metricsByTimestamp[timestamp][metricName] = point.value;
          }
        });
      });

      // Convert to route points array
      Object.values(metricsByTimestamp).forEach((data: any, index: number) => {
        if (data.lat !== null && data.lng !== null) {
          routePoints.push({
            id: `point-${index}-${data.timestamp}`,
            timestamp: data.timestamp,
            latitude: data.lat,
            longitude: data.lng,
            pm1: data.pm1 || 0,
            pm25: data.pm25 || 0,
            pm10: data.pm10 || 0,
            temperature: data.temperature_c || 0,
            humidity: data.humidity_rh || 0,
            co2: data.co2_ppm || 0,
            tvoc: data.tvoc_index || 0,
          });
        }
      });

      // Sort by timestamp
      routePoints.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      if (routePoints.length === 0) {
        console.log('❌ No valid GPS points found');
        return null;
      }

      console.log(`✅ Created route with ${routePoints.length} points`);

      // Calculate route statistics
      const pm25Values = routePoints.map((p) => p.pm25).filter((v) => v > 0);
      const avgPm25 = pm25Values.length > 0
        ? pm25Values.reduce((sum, val) => sum + val, 0) / pm25Values.length
        : 0;
      const maxPm25 = pm25Values.length > 0 ? Math.max(...pm25Values) : 0;
      const minPm25 = pm25Values.length > 0 ? Math.min(...pm25Values) : 0;

      // Calculate total distance (simple approximation)
      let totalDistance = 0;
      for (let i = 1; i < routePoints.length; i++) {
        const prev = routePoints[i - 1];
        const curr = routePoints[i];
        const distance = calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
        totalDistance += distance;
      }

      const route: MobileRoute = {
        id: `${sensor.id}-${fromDateUTC}-${toDateUTC}`,
        deviceName: sensor.name,
        deviceId: sensor.id,
        startTime: routePoints[0].timestamp,
        endTime: routePoints[routePoints.length - 1].timestamp,
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        averagePm25: parseFloat(avgPm25.toFixed(1)),
        maxPm25: parseFloat(maxPm25.toFixed(1)),
        minPm25: parseFloat(minPm25.toFixed(1)),
        points: routePoints,
      };

      return route;
    } catch (error) {
      console.error('❌ Error fetching route range:', error);
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

      // Convert selected date (UTC+7) to UTC time range for API
      // User selects Oct 28 → means Oct 28 00:00 to 23:59 in UTC+7
      // API needs: Oct 27 17:00 to Oct 28 16:59 in UTC
      const selectedDate = new Date(date + 'T00:00:00+07:00'); // Start of day in UTC+7
      const fromDate = formatTimestampForApi(selectedDate); // Converts to UTC

      const endDate = new Date(date + 'T23:59:59+07:00'); // End of day in UTC+7
      const toDate = formatTimestampForApi(endDate); // Converts to UTC
      
      console.log('🕐 Timezone conversion:', {
        selectedDate: date,
        fromUTC7: date + ' 00:00:00 +07:00',
        toUTC7: date + ' 23:59:59 +07:00',
        fromUTC: fromDate,
        toUTC: toDate,
      });

      // Call history API with All metrics and 1-minute aggregation for GPS accuracy
      const response = await axios.get(`${API_CONFIG.baseURL}${API_ENDPOINTS.sensorHistory}`, {
        params: {
          sensor_code: sensor.code,
          metric: 'All', // Get all parameters
          from: fromDate, // Start of selected date
          to: toDate,     // End of selected date
          agg_minutes: 60, // 5-minute intervals for route accuracy
        },
        timeout: API_CONFIG.timeout,
      });

      const apiData = response.data;

      console.log('📊 API Response:', {
        metricsCount: apiData.metrics?.length,
        firstMetric: apiData.metrics?.[0]?.metric,
        firstPointSample: apiData.metrics?.[0]?.points?.[0],
      });

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

      // Filter points to only include those from the selected date (UTC+7)
      // Use the same timezone boundaries as the API request
      const startOfDay = new Date(date + 'T00:00:00+07:00'); // Start of day in UTC+7
      const endOfDay = new Date(date + 'T23:59:59+07:00'); // End of day in UTC+7

      // Create a map of timestamp -> values for each metric
      const metricsByTimestamp: Record<string, any> = {};
      
      // Debug: Log all metric names
      console.log('📊 Available metrics:', apiData.metrics.map((m: any) => m.metric));
      
      apiData.metrics.forEach((metricData: any) => {
        metricData.points.forEach((point: any) => {
          const timestamp = point.ts || point.timestamp || point.time;
          const pointDate = new Date(timestamp); // Timestamp from API is in UTC
          
          // Only include points from selected date in UTC+7 timezone
          if (pointDate >= startOfDay && pointDate <= endOfDay) {
            if (!metricsByTimestamp[timestamp]) {
              metricsByTimestamp[timestamp] = {
                timestamp,
                // GPS coordinates - extract from API response (now returns lat/lng on each point)
                latitude: null,
                longitude: null,
              };
            }
            
            // Update GPS coordinates if available (API now sends lat/lng on each point)
            if (point.lat !== undefined && point.lat !== null) {
              metricsByTimestamp[timestamp].latitude = point.lat;
            }
            if (point.lng !== undefined && point.lng !== null) {
              metricsByTimestamp[timestamp].longitude = point.lng;
            }
            // Also check for full names as fallback
            if (point.latitude !== undefined && point.latitude !== null && metricsByTimestamp[timestamp].latitude === null) {
              metricsByTimestamp[timestamp].latitude = point.latitude;
            }
            if (point.longitude !== undefined && point.longitude !== null && metricsByTimestamp[timestamp].longitude === null) {
              metricsByTimestamp[timestamp].longitude = point.longitude;
            }
            
            // Add metric value
            const metricName = metricData.metric.toLowerCase();
            metricsByTimestamp[timestamp][metricName] = point.value;
          }
        });
      });

      // Convert to array and sort by timestamp
      const timestamps = Object.keys(metricsByTimestamp).sort();
      
      // Debug: Log sample data point
      if (timestamps.length > 0) {
        console.log('🔍 Sample data point:', metricsByTimestamp[timestamps[0]]);
      }
      
      console.log('📍 Processing GPS data:', {
        totalTimestamps: timestamps.length,
        sampleData: timestamps.slice(0, 3).map(ts => ({
          ts,
          lat: metricsByTimestamp[ts].latitude,
          lng: metricsByTimestamp[ts].longitude,
        })),
      });

      let skippedCount = 0;
      timestamps.forEach((timestamp, index) => {
        const data = metricsByTimestamp[timestamp];
        
        // Skip points without valid GPS coordinates
        if (!data.latitude || !data.longitude) {
          skippedCount++;
          return;
        }

        // Debug: Log first point's data mapping
        if (index === 0) {
          console.log('🔍 First point data mapping:', {
            humidity: data.humidity,
            humidity_rh: data.humidity_rh,
            co2: data.co2,
            co2_ppm: data.co2_ppm,
            tvoc: data.tvoc,
            tvoc_ppb: data.tvoc_ppb,
            allKeys: Object.keys(data)
          });
        }

        routePoints.push({
          id: `point-${index}`,
          latitude: data.latitude,
          longitude: data.longitude,
          pm1: data.pm1 || 0,
          pm25: data.pm25 || data.pm2_5 || 0,
          pm10: data.pm10 || 0,
          particle_0p3: data.particle_0p3 !== undefined ? data.particle_0p3 : undefined,
          temperature: data.temperature || data.temperature_c || 0,
          humidity: data.humidity || data.humidity_rh || 0,
          co2: data.co2 || data.co2_ppm || 0,
          tvoc: data.tvoc || data.tvoc_ppb || 0,
          tvoc_index: data.tvoc_index !== undefined ? data.tvoc_index : undefined,
          nox_index: data.nox_index !== undefined ? data.nox_index : undefined,
          tvoc_raw_logr: data.tvoc_raw_logr !== undefined ? data.tvoc_raw_logr : undefined,
          nox_raw_logr: data.nox_raw_logr !== undefined ? data.nox_raw_logr : undefined,
          timestamp: timestamp,
          speed: data.speed || undefined,
        });
      });

      if (skippedCount > 0) {
        console.warn(`⚠️ Skipped ${skippedCount} points without GPS coordinates`);
      }

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
