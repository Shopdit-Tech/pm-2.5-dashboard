import axios from 'axios';
import type {
  AdminSensor,
  GetSensorsResponse,
  CreateSensorRequest,
  CreateSensorResponse,
  UpdateSensorRequest,
  UpdateSensorResponse,
  DeleteSensorResponse,
} from '../types/sensor';

// Use Next.js API proxy to avoid CORS issues
const API_BASE_URL = '/api';

/**
 * Get authorization token from localStorage
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const authUser = localStorage.getItem('pm25_auth_user');
  if (authUser) {
    try {
      const parsed = JSON.parse(authUser);
      return parsed.access_token || parsed.token || null;
    } catch (error) {
      console.error('Failed to parse auth user:', error);
      return null;
    }
  }
  return null;
};

/**
 * Create axios instance with auth header
 */
const createAuthClient = () => {
  const token = getAuthToken();
  
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    timeout: 30000,
  });
};

export const sensorService = {
  /**
   * Get all sensors (admin only)
   */
  async getSensors(): Promise<AdminSensor[]> {
    try {
      console.log('📊 Fetching all sensors...');
      
      const client = createAuthClient();
      const response = await client.get<GetSensorsResponse>('/sensors-admin');
      
      console.log('✅ Fetched', response.data.sensors.length, 'sensors');
      return response.data.sensors;
    } catch (error: any) {
      console.error('❌ Error fetching sensors:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch sensors');
    }
  },

  /**
   * Create new sensor (admin only)
   */
  async createSensor(data: CreateSensorRequest): Promise<AdminSensor> {
    try {
      console.log('➕ Creating sensor:', data.code);
      
      const client = createAuthClient();
      const response = await client.post<CreateSensorResponse>('/sensors-admin', data);
      
      console.log('✅ Sensor created:', response.data.sensor.id);
      return response.data.sensor;
    } catch (error: any) {
      console.error('❌ Error creating sensor:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid sensor data. Please check all fields.');
      } else if (error.response?.status === 409) {
        throw new Error('Sensor with this code already exists.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to create sensors.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create sensor');
    }
  },

  /**
   * Update sensor (admin only)
   */
  async updateSensor(data: UpdateSensorRequest): Promise<AdminSensor> {
    try {
      console.log('✏️ Updating sensor:', data.code);
      
      const client = createAuthClient();
      const response = await client.patch<UpdateSensorResponse>('/sensors-admin', data);
      
      console.log('✅ Sensor updated:', response.data.sensor.id);
      return response.data.sensor;
    } catch (error: any) {
      console.error('❌ Error updating sensor:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Sensor not found.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to update sensors.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to update sensor');
    }
  },

  /**
   * Delete sensor (admin only)
   */
  async deleteSensor(id: string): Promise<string> {
    try {
      console.log('🗑️ Deleting sensor:', id);
      
      const client = createAuthClient();
      const response = await client.delete<DeleteSensorResponse>('/sensors-admin', {
        params: { id },
      });
      
      console.log('✅ Sensor deleted:', response.data.deleted_id);
      return response.data.deleted_id;
    } catch (error: any) {
      console.error('❌ Error deleting sensor:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Sensor not found.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete sensors.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete sensor');
    }
  },
};
