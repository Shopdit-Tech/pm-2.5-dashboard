import { useState, useEffect, useCallback } from 'react';
import { SensorData } from '@/types/sensor';
import { mobileRouteService } from '@/features/mobile-routes/services/mobileRouteService';

type UseMobileSensorTableDataReturn = {
  sensors: SensorData[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

/**
 * Hook for fetching mobile sensor data for table display
 * @param autoRefreshInterval - Auto-refresh interval in milliseconds (default: 30 seconds)
 */
export const useMobileSensorTableData = (autoRefreshInterval: number = 30000): UseMobileSensorTableDataReturn => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSensors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 [Mobile Table] Fetching mobile sensors...');
      const data = await mobileRouteService.getMobileSensors();
      
      setSensors(data);
      console.log(`✅ [Mobile Table] Loaded ${data.length} mobile sensors`);
    } catch (err) {
      setError(err as Error);
      console.error('❌ [Mobile Table] Failed to fetch sensors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSensors();
  }, [fetchSensors]);

  // Auto-refresh functionality (faster for mobile sensors)
  useEffect(() => {
    if (!autoRefreshInterval) return;

    const intervalId = setInterval(() => {
      console.log('🔄 [Mobile Table] Auto-refreshing sensors...');
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
