// import axios from '@/lib/axios'; // TODO: Use when backend API is ready
import { SensorData } from '@/types/sensor';
import { MOCK_SENSORS } from './mockSensorData';

export const sensorService = {
  // Get all sensors
  getAllSensors: async (): Promise<SensorData[]> => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await axios.get<SensorData[]>('/sensors');
      // return response.data;

      // For now, return mock data with random variations
      return Promise.resolve(
        MOCK_SENSORS.map((sensor) => ({
          ...sensor,
          // Add small random variations to simulate real-time changes
          pm25: sensor.status === 'online' ? sensor.pm25 + (Math.random() - 0.5) * 2 : 0,
          temperature:
            sensor.status === 'online' ? sensor.temperature + (Math.random() - 0.5) * 0.5 : 0,
          humidity: sensor.status === 'online' ? sensor.humidity + (Math.random() - 0.5) * 2 : 0,
          timestamp: new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error('Error fetching sensors:', error);
      throw error;
    }
  },

  // Get sensor by ID
  getSensorById: async (id: string): Promise<SensorData | null> => {
    try {
      // TODO: Replace with actual API call
      // const response = await axios.get<SensorData>(`/sensors/${id}`);
      // return response.data;

      const sensor = MOCK_SENSORS.find((s) => s.id === id);
      return Promise.resolve(sensor || null);
    } catch (error) {
      console.error(`Error fetching sensor ${id}:`, error);
      throw error;
    }
  },

  // Get sensors by type
  getSensorsByType: async (type: 'indoor' | 'outdoor' | 'mobile'): Promise<SensorData[]> => {
    try {
      const allSensors = await sensorService.getAllSensors();
      return allSensors.filter((sensor) => sensor.type === type);
    } catch (error) {
      console.error(`Error fetching ${type} sensors:`, error);
      throw error;
    }
  },
};
