import { SensorData } from '@/types/sensor';
import { getMobileSensors } from '@/services/sensorApi';
import { mapApiSensorsToAppSensors } from '@/utils/sensorMapper';

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
};
