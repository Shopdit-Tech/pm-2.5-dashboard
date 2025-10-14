export type TimeRange = '1h' | '8h' | '24h' | '48h' | '7d' | '30d';

export type TimeSeriesDataPoint = {
  timestamp: string;
  value: number;
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
  switch (range) {
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
  }
}

export function getTimeRangeLabel(range: TimeRange): string {
  switch (range) {
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
  }
}

export function getAggregationInterval(range: TimeRange): AggregationInterval {
  switch (range) {
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
