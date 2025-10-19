import { useState, useEffect, useCallback } from 'react';
import { SensorData } from '@/types/sensor';
import { mobileRouteService } from '../services/mobileRouteService';

type UseMobileSensorsReturn = {
  sensors: SensorData[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

/**
 * Hook for fetching mobile sensor data
 * @param autoRefreshInterval - Auto-refresh interval in milliseconds (default: 30 seconds for mobile)
 */
export const useMobileSensors = (autoRefreshInterval: number = 30000): UseMobileSensorsReturn => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSensors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mobileRouteService.getMobileSensors();
      setSensors(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch mobile sensors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSensors();
  }, [fetchSensors]);

  // Auto-refresh functionality (faster refresh for mobile sensors)
  useEffect(() => {
    if (!autoRefreshInterval) return;

    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing mobile sensors...');
      fetchSensors();
    }, autoRefreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, fetchSensors]);

  return {
    sensors,
    loading,
    error,
    refetch: fetchSensors,
  };
};
