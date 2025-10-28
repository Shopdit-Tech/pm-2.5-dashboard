import axios from 'axios';
import type {
  AdminUser,
  CreateUserRequest,
  CreateUserResponse,
  DeleteUserResponse,
  GetUsersResponse,
} from '../types/user';

// Use Next.js API proxy to avoid CORS issues
const API_BASE_URL = '/api';

/**
 * Get authorization token from localStorage
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try to get token from localStorage (adjust key based on your auth implementation)
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

export const userService = {
  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<AdminUser[]> {
    try {
      console.log('📊 Fetching all users...');
      
      const client = createAuthClient();
      const response = await client.get<GetUsersResponse>('/users');
      
      console.log('✅ Fetched', response.data.users.length, 'users');
      return response.data.users;
    } catch (error: any) {
      console.error('❌ Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  /**
   * Create new user (admin only)
   */
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      console.log('➕ Creating user:', userData.email);
      
      const client = createAuthClient();
      const response = await client.post<CreateUserResponse>('/users', userData);
      
      console.log('✅ User created:', response.data.user_id);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating user:', error);
      
      // Handle specific error messages
      if (error.response?.status === 400) {
        throw new Error('Invalid user data. Please check email and password requirements.');
      } else if (error.response?.status === 409) {
        throw new Error('User with this email already exists.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to create users.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<DeleteUserResponse> {
    try {
      console.log('🗑️ Deleting user:', userId);
      
      const client = createAuthClient();
      const response = await client.delete<DeleteUserResponse>('/users', {
        params: { user_id: userId },
      });
      
      console.log('✅ User deleted:', response.data.deleted_user_id);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting user:', error);
      
      // Handle specific error messages
      if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete users.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },
};
