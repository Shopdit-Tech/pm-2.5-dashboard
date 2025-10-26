import type { TimeRangeConfig } from '../constants/timeRanges';

// Legacy time range type for backward compatibility
export type LegacyTimeRange = '1h' | '8h' | '24h' | '48h' | '7d' | '30d';

// TimeRange can now be either a config object or legacy string
export type TimeRange = TimeRangeConfig | LegacyTimeRange | string;

export type TimeSeriesDataPoint = {
  timestamp: string;
  value: number | null;  // Allow null to show gaps in charts
  formattedTime?: string;
  formattedDate?: string;
};

export type ChartData = {
  sensorId: string;
  sensorName: string;
  parameter: string;
  data: TimeSeriesDataPoint[];
  average: number;
  min: number;
  max: number;
  color?: string;
};

export type AggregationInterval = '5min' | '15min' | '1hour' | '2hour' | '6hour' | '1day';

export type ChartConfig = {
  parameter: string;
  sensorId: string;
  timeRange: TimeRange;
};

export function getTimeRangeHours(range: TimeRange): number {
  // Handle new TimeRangeConfig object
  if (typeof range === 'object' && range !== null && 'since_hours' in range) {
    return range.since_hours;
  }
  
  // Handle legacy string format
  const rangeStr = range as string;
  switch (rangeStr) {
    case '1h':
      return 1;
    case '8h':
      return 8;
    case '24h':
      return 24;
    case '48h':
      return 48;
    case '7d':
      return 168; // 7 * 24
    case '30d':
      return 720; // 30 * 24
    default:
      return 24; // Default fallback
  }
}

export function getTimeRangeLabel(range: TimeRange): string {
  // Handle new TimeRangeConfig object
  if (typeof range === 'object' && range !== null && 'label' in range) {
    return range.label;
  }
  
  // Handle legacy string format
  const rangeStr = range as string;
  switch (rangeStr) {
    case '1h':
      return 'Last 1 Hour';
    case '8h':
      return 'Last 8 Hours';
    case '24h':
      return 'Last 24 Hours';
    case '48h':
      return 'Last 48 Hours';
    case '7d':
      return 'Last 7 Days';
    case '30d':
      return 'Last 30 Days';
    default:
      return rangeStr; // Return the string itself as fallback
  }
}

export function getAggregationInterval(range: TimeRange): AggregationInterval {
  // Handle new TimeRangeConfig object - return based on agg_minutes
  if (typeof range === 'object' && range !== null && 'agg_minutes' in range) {
    const minutes = range.agg_minutes;
    if (minutes <= 5) return '5min';
    if (minutes <= 15) return '15min';
    if (minutes <= 60) return '1hour';
    if (minutes <= 120) return '2hour';
    if (minutes <= 360) return '6hour';
    return '1day';
  }
  
  // Handle legacy string format
  const rangeStr = range as string;
  switch (rangeStr) {
    case '1h':
      return '5min';
    case '8h':
      return '15min';
    case '24h':
    case '48h':
      return '1hour';
    case '7d':
      return '6hour';
    case '30d':
      return '1day';
    default:
      return '1hour'; // Default fallback
  }
}

export function getIntervalMinutes(interval: AggregationInterval): number {
  switch (interval) {
    case '5min':
      return 5;
    case '15min':
      return 15;
    case '1hour':
      return 60;
    case '2hour':
      return 120;
    case '6hour':
      return 360;
    case '1day':
      return 1440;
  }
}

/**
 * Get aggregation minutes directly from TimeRange
 * This is the preferred way for new code
 */
export function getAggregationMinutes(range: TimeRange): number {
  // Handle new TimeRangeConfig object
  if (typeof range === 'object' && range !== null && 'agg_minutes' in range) {
    return range.agg_minutes;
  }
  
  // Handle legacy string format - convert through interval
  const interval = getAggregationInterval(range);
  return getIntervalMinutes(interval);
}

/**
 * Get time range ID for use as key in UI components
 */
export function getTimeRangeId(range: TimeRange): string {
  if (typeof range === 'object' && range !== null && 'id' in range) {
    return range.id;
  }
  return range as string;
}
