import axios from 'axios';
import axiosInstance from '../../../lib/axios';
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

export const thresholdService = {
  /**
   * Get all thresholds (PUBLIC API - no auth required, uses x-ingest-key via proxy)
   */
  async getThresholds(): Promise<Threshold[]> {
    try {
      console.log('📊 Fetching all thresholds (public)...');
      
      // Call Next.js API proxy (same pattern as sensors/latest)
      const response = await axios.get<GetThresholdsResponse>(`${API_BASE_URL}/thresholds`, {
        timeout: 30000,
      });
      
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
      
      const response = await axiosInstance.post<CreateThresholdResponse>('/thresholds', data);
      
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
      
      const response = await axiosInstance.patch<UpdateThresholdResponse>('/thresholds', data);
      
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
      
      const response = await axiosInstance.delete<DeleteThresholdResponse>('/thresholds', {
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
