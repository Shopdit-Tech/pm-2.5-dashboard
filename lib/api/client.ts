import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, validateApiConfig } from './config';

// Create axios instance with default config
const createApiClient = (): AxiosInstance => {
  // Validate configuration
  if (!validateApiConfig()) {
    console.warn('⚠️ API configuration is invalid, using default settings');
  }

  const client = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers,
  });

  // Request interceptor - Log requests (no auth needed, handled by proxy)
  client.interceptors.request.use(
    (config) => {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('❌ Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle common errors
  client.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error: AxiosError) => {
      // Handle specific error cases
      if (error.response) {
        const status = error.response.status;
        const url = error.config?.url;
        
        switch (status) {
          case 401:
            console.error(`🔒 Unauthorized: ${url}`);
            break;
          case 403:
            console.error(`🚫 Forbidden: ${url}`);
            break;
          case 404:
            console.error(`❓ Not Found: ${url}`);
            break;
          case 500:
            console.error(`💥 Server Error: ${url}`);
            break;
          default:
            console.error(`❌ API Error (${status}): ${url}`);
        }
      } else if (error.request) {
        console.error('📡 Network Error: No response received');
      } else {
        console.error('❌ Request Setup Error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

// Export singleton instance
export const apiClient = createApiClient();
