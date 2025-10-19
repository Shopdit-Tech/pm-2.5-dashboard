import { useState, useEffect, useCallback } from 'react';
import { SensorData } from '@/types/sensor';
import { sensorService } from '@/features/map-dashboard/services/sensorService';

type UseSensorTableDataReturn = {
  sensors: SensorData[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

/**
 * Hook for fetching static sensor data for table display
 * @param autoRefreshInterval - Auto-refresh interval in milliseconds (default: 60 seconds)
 */
export const useSensorTableData = (autoRefreshInterval: number = 60000): UseSensorTableDataReturn => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSensors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 [Table] Fetching static sensors...');
      const data = await sensorService.getAllSensors();
      
      setSensors(data);
      console.log(`✅ [Table] Loaded ${data.length} static sensors`);
    } catch (err) {
      setError(err as Error);
      console.error('❌ [Table] Failed to fetch sensors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSensors();
  }, [fetchSensors]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefreshInterval) return;

    const intervalId = setInterval(() => {
      console.log('🔄 [Table] Auto-refreshing sensors...');
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
