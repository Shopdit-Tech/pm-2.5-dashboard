import { useState, useEffect } from 'react';
import { SensorData } from '@/types/sensor';
import { TimeRange, ChartData } from '../types/chartTypes';
import { fetchRealChartData } from '../services/chartDataService';

type UseChartDataReturn = {
  chartData: ChartData | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Hook for fetching chart data from real API
 * @param sensor - Sensor to fetch data for
 * @param parameter - Parameter to fetch
 * @param timeRange - Time range for data
 */
export const useChartData = (
  sensor: SensorData | undefined,
  parameter: keyof Pick<SensorData, 'temperature' | 'humidity' | 'co2' | 'pm1' | 'pm25' | 'pm10' | 'tvoc'>,
  timeRange: TimeRange
): UseChartDataReturn => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!sensor) {
        setChartData(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchRealChartData(sensor, parameter, timeRange);
        
        if (isMounted) {
          setChartData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          console.error('Error fetching chart data:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [sensor?.id, parameter, timeRange]);

  return {
    chartData,
    loading,
    error,
  };
};
