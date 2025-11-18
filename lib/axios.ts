import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const AUTH_STORAGE_KEY = 'pm25_auth_user';

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Function to get stored auth data
const getAuthData = () => {
  if (typeof window === 'undefined') return null;
  const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!storedData) return null;
  try {
    return JSON.parse(storedData);
  } catch {
    return null;
  }
};

// Function to update stored access token
const updateAccessToken = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return;
  const authData = getAuthData();
  if (authData) {
    authData.access_token = accessToken;
    authData.refresh_token = refreshToken;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  }
};

// Subscribe to token refresh
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers when token is refreshed
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Refresh the access token
const refreshAccessToken = async (): Promise<string> => {
  const authData = getAuthData();
  if (!authData?.refresh_token) {
    throw new Error('No refresh token available');
  }

  try {
    console.log('🔄 Calling refresh token endpoint...');
    const response = await axios.post(
      '/api/auth/refresh', // Use relative path so it works in both dev and prod
      { refresh_token: authData.refresh_token },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    const { access_token, refresh_token } = response.data;
    if (!access_token || !refresh_token) {
      throw new Error('Invalid refresh response: missing tokens');
    }
    
    updateAccessToken(access_token, refresh_token);
    console.log('✅ Token refreshed successfully');
    return access_token;
  } catch (error: any) {
    console.error('❌ Token refresh failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    // Only clear auth if it's an authentication error (invalid/expired refresh token)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('🚪 Refresh token is invalid or expired, clearing auth data...');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        // Reload to reset app state - user will see login button
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
    throw error;
  }
};

const axiosInstance = axios.create({
  baseURL: '/api', // Use relative path so it works in both dev and prod
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const authData = getAuthData();
    if (authData?.access_token) {
      config.headers.Authorization = `Bearer ${authData.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check if error is 401/403 and we haven't retried yet
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      originalRequest &&
      !originalRequest._retry
    ) {
      console.error(`Received ${error.response.status} error, attempting token refresh...`);
      
      if (isRefreshing) {
        // If already refreshing, wait for the new token
        console.error('Token refresh already in progress, waiting...');
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        isRefreshing = false;
        onTokenRefreshed(newAccessToken);

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        console.log('🔁 Retrying original request with new token...');
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed, cannot retry request');
        isRefreshing = false;
        refreshSubscribers = [];
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
