import { useState, useEffect, useCallback } from 'react';
import { SensorData } from '@/types/sensor';
import { sensorService } from '../services/sensorService';

type UseSensorDataReturn = {
  sensors: SensorData[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export const useSensorData = (autoRefreshInterval?: number): UseSensorDataReturn => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSensors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sensorService.getAllSensors();
      setSensors(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch sensors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSensors();
  }, [fetchSensors]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefreshInterval) return;

    const intervalId = setInterval(() => {
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
