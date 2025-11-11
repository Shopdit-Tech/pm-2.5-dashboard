import axios from 'axios';
import type {
  Threshold,
  GetThresholdsResponse,
  CreateThresholdRequest,
  CreateThresholdResponse,
  UpdateThresholdRequest,
  UpdateThresholdResponse,
  DeleteThresholdRequest,
  DeleteThresholdResponse,
} from '../types/threshold';

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

export const thresholdService = {
  /**
   * Get all thresholds (admin only)
   */
  async getThresholds(): Promise<Threshold[]> {
    try {
      console.log('📊 Fetching all thresholds...');
      
      const client = createAuthClient();
      const response = await client.get<GetThresholdsResponse>('/thresholds');
      
      console.log('✅ Fetched', response.data.items.length, 'thresholds');
      return response.data.items;
    } catch (error: any) {
      console.error('❌ Error fetching thresholds:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch thresholds');
    }
  },

  /**
   * Create new threshold (admin only)
   */
  async createThreshold(data: CreateThresholdRequest): Promise<Threshold> {
    try {
      console.log('➕ Creating threshold:', data.metric, data.level);
      
      const client = createAuthClient();
      const response = await client.post<CreateThresholdResponse>('/thresholds', data);
      
      console.log('✅ Threshold created:', response.data.item.id);
      return response.data.item;
    } catch (error: any) {
      console.error('❌ Error creating threshold:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid threshold data. Please check all fields.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to create thresholds.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create threshold');
    }
  },

  /**
   * Update threshold (admin only)
   */
  async updateThreshold(data: UpdateThresholdRequest): Promise<Threshold> {
    try {
      console.log('✏️ Updating threshold:', data.id);
      
      const client = createAuthClient();
      const response = await client.patch<UpdateThresholdResponse>('/thresholds', data);
      
      console.log('✅ Threshold updated:', response.data.item.id);
      return response.data.item;
    } catch (error: any) {
      console.error('❌ Error updating threshold:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Threshold not found.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to update thresholds.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to update threshold');
    }
  },

  /**
   * Delete threshold (admin only)
   */
  async deleteThreshold(id: string): Promise<string> {
    try {
      console.log('🗑️ Deleting threshold:', id);
      
      const client = createAuthClient();
      const response = await client.delete<DeleteThresholdResponse>('/thresholds', {
        data: { id } as DeleteThresholdRequest,
      });
      
      console.log('✅ Threshold deleted:', response.data.deleted_id);
      return response.data.deleted_id;
    } catch (error: any) {
      console.error('❌ Error deleting threshold:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Threshold not found.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete thresholds.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete threshold');
    }
  },
};
