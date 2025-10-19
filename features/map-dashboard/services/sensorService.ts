import { SensorData } from '@/types/sensor';
import { getStaticSensors } from '@/services/sensorApi';
import { mapApiSensorsToAppSensors } from '@/utils/sensorMapper';

export const sensorService = {
  // Get all static sensors (movable=false)
  getAllSensors: async (): Promise<SensorData[]> => {
    try {
      console.log('🔄 Fetching static sensors from real API...');
      
      // Call real API
      const response = await getStaticSensors();
      
      // Map API response to app format
      const sensors = mapApiSensorsToAppSensors(response.items);
      
      console.log(`✅ Successfully fetched ${sensors.length} static sensors`);
      return sensors;
    } catch (error) {
      console.error('❌ Error fetching sensors:', error);
      
      // Return empty array on error to prevent app crash
      return [];
    }
  },

  // Get sensor by ID
  getSensorById: async (id: string): Promise<SensorData | null> => {
    try {
      // Get all sensors and find by ID
      const allSensors = await sensorService.getAllSensors();
      const sensor = allSensors.find((s) => s.id === id);
      
      return sensor || null;
    } catch (error) {
      console.error(`❌ Error fetching sensor ${id}:`, error);
      return null;
    }
  },

  // Get sensor by code (for API calls)
  getSensorByCode: async (code: string): Promise<SensorData | null> => {
    try {
      const allSensors = await sensorService.getAllSensors();
      const sensor = allSensors.find((s) => s.code === code);
      
      return sensor || null;
    } catch (error) {
      console.error(`❌ Error fetching sensor ${code}:`, error);
      return null;
    }
  },

  // Get sensors by type
  getSensorsByType: async (type: 'indoor' | 'outdoor' | 'mobile'): Promise<SensorData[]> => {
    try {
      const allSensors = await sensorService.getAllSensors();
      return allSensors.filter((sensor) => sensor.type === type);
    } catch (error) {
      console.error(`❌ Error fetching ${type} sensors:`, error);
      return [];
    }
  },
};
