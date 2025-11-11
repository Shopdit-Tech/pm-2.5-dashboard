'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { thresholdService } from '@/features/admin/services/thresholdService';
import type { Threshold, ThresholdMetric } from '@/features/admin/types/threshold';
import type { ParameterType } from '@/types/sensor';

// Mapping between old ParameterType names and new ThresholdMetric names
const PARAMETER_TO_METRIC_MAP: Record<ParameterType, ThresholdMetric> = {
  pm1: 'pm1',
  pm25: 'pm25',
  pm10: 'pm10',
  co2: 'co2_ppm',
  tvoc: 'tvoc_ppb',
  temperature: 'temperature_c',
  humidity: 'humidity_rh',
};

type ThresholdContextType = {
  thresholds: Threshold[];
  loading: boolean;
  error: string | null;
  getColorForValue: (parameter: ParameterType | ThresholdMetric, value: number) => string;
  getThresholdsForMetric: (parameter: ParameterType | ThresholdMetric) => Threshold[];
  refreshThresholds: () => Promise<void>;
};

const ThresholdContext = createContext<ThresholdContextType | undefined>(undefined);

type ThresholdProviderProps = {
  children: ReactNode;
};

export const ThresholdProvider = ({ children }: ThresholdProviderProps) => {
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThresholds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await thresholdService.getThresholds();
      setThresholds(data);
    } catch (err: any) {
      console.error('Failed to load thresholds:', err);
      setError(err.message || 'Failed to load thresholds');
      // Use empty array on error so app doesn't break
      setThresholds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThresholds();
  }, []);

  /**
   * Convert old parameter name to new metric name
   */
  const normalizeParameter = (parameter: ParameterType | ThresholdMetric): ThresholdMetric => {
    // If it's already a ThresholdMetric (new format), return as-is
    if (['co2_ppm', 'tvoc_ppb', 'temperature_c', 'humidity_rh'].includes(parameter)) {
      return parameter as ThresholdMetric;
    }
    // Otherwise, map from old ParameterType to new ThresholdMetric
    return PARAMETER_TO_METRIC_MAP[parameter as ParameterType] || (parameter as ThresholdMetric);
  };

  /**
   * Get color for a specific value based on thresholds
   */
  const getColorForValue = (parameter: ParameterType | ThresholdMetric, value: number): string => {
    const metric = normalizeParameter(parameter);
    const metricThresholds = thresholds
      .filter((t) => t.metric === metric)
      .sort((a, b) => a.sort_order - b.sort_order);

    // Find the matching threshold range
    for (const threshold of metricThresholds) {
      if (value >= threshold.min_value && value <= threshold.max_value) {
        return threshold.color_hex;
      }
    }

    // Default: return last threshold color (usually hazardous) or gray
    return metricThresholds.length > 0 
      ? metricThresholds[metricThresholds.length - 1].color_hex 
      : '#d9d9d9';
  };

  /**
   * Get all thresholds for a specific metric
   */
  const getThresholdsForMetric = (parameter: ParameterType | ThresholdMetric): Threshold[] => {
    const metric = normalizeParameter(parameter);
    return thresholds
      .filter((t) => t.metric === metric)
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  /**
   * Manually refresh thresholds (useful after admin updates)
   */
  const refreshThresholds = async () => {
    await loadThresholds();
  };

  const value: ThresholdContextType = {
    thresholds,
    loading,
    error,
    getColorForValue,
    getThresholdsForMetric,
    refreshThresholds,
  };

  return (
    <ThresholdContext.Provider value={value}>
      {children}
    </ThresholdContext.Provider>
  );
};

/**
 * Hook to access threshold context
 */
export const useThreshold = (): ThresholdContextType => {
  const context = useContext(ThresholdContext);
  if (!context) {
    throw new Error('useThreshold must be used within ThresholdProvider');
  }
  return context;
};
