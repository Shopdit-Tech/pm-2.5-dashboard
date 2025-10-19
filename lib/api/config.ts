// API Configuration

// Use Next.js API proxy to avoid CORS issues
export const API_CONFIG = {
  baseURL: '/api/sensors', // Use Next.js API routes as proxy
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints (proxied through Next.js)
export const API_ENDPOINTS = {
  sensorsLatest: '/latest', // Maps to /api/sensors/latest
  sensorHistory: '/history', // Maps to /api/sensors/history
} as const;

// Validate configuration (client-side only needs baseURL)
export const validateApiConfig = (): boolean => {
  if (!API_CONFIG.baseURL) {
    console.error('❌ API baseURL is not configured');
    return false;
  }
  return true;
};
