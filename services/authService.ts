import axios from 'axios';

// Use Next.js API proxy to avoid CORS issues
const API_BASE_URL = '/api';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    app_metadata: {
      role: 'admin' | 'user';
      provider: string;
      providers: string[];
    };
    user_metadata: {
      email_verified: boolean;
    };
    created_at: string;
    last_sign_in_at: string;
  };
};

export type UserProfile = {
  id: string;
  email: string;
  app_metadata: {
    role: 'admin' | 'user';
    provider: string;
    providers: string[];
  };
  user_metadata: {
    email_verified: boolean;
  };
  created_at: string;
  last_sign_in_at: string;
};

export const authService = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('🔐 Logging in user:', credentials.email);
      
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      
      console.log('✅ Login successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 400) {
        throw new Error('Please provide both email and password');
      }
      
      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  },

  /**
   * Get current user profile (requires auth token)
   */
  async getProfile(token: string): Promise<UserProfile> {
    try {
      console.log('👤 Fetching user profile...');
      
      const response = await axios.get<UserProfile>(
        `${API_BASE_URL}/auth-me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      
      console.log('✅ Profile fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch profile:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
  },
};
