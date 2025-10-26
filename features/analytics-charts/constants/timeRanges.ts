/**
 * Time Range Configuration
 * Defines all available time ranges with their aggregation intervals
 */

export type TimeRangeConfig = {
  id: string;
  label: string;
  since_hours: number;
  agg_minutes: number;
};

/**
 * All available time range options with appropriate aggregation intervals
 * Based on requirements: shorter periods = finer granularity, longer periods = coarser aggregation
 */
export const TIME_RANGES: TimeRangeConfig[] = [
  {
    id: '8h',
    label: 'Last 8 hours (5 min)',
    since_hours: 8,
    agg_minutes: 5,
  },
  {
    id: '12h',
    label: 'Last 12 hours (10 min)',
    since_hours: 12,
    agg_minutes: 10,
  },
  {
    id: '24h',
    label: 'Last 24 hours (15 min)',
    since_hours: 24,
    agg_minutes: 15,
  },
  {
    id: '48h',
    label: 'Last 48 hours (15 min)',
    since_hours: 48,
    agg_minutes: 15,
  },
  {
    id: '7d',
    label: 'Last Week (1 hour)',
    since_hours: 168, // 7 * 24
    agg_minutes: 60,
  },
  {
    id: '30d-daily',
    label: 'Last 30 days (1 day)',
    since_hours: 720, // 30 * 24
    agg_minutes: 1440, // 24 * 60
  },
  {
    id: '30d-hourly',
    label: 'Last 30 days (1 hour)',
    since_hours: 720, // 30 * 24
    agg_minutes: 60,
  },
  {
    id: '90d',
    label: 'Last 90 days (1 day)',
    since_hours: 2160, // 90 * 24
    agg_minutes: 1440,
  },
  {
    id: '180d',
    label: 'Last 180 days (1 day)',
    since_hours: 4320, // 180 * 24
    agg_minutes: 1440,
  },
  {
    id: '360d',
    label: 'Last 360 days (1 day)',
    since_hours: 8640, // 360 * 24
    agg_minutes: 1440,
  },
  {
    id: '720d',
    label: 'Last 720 days (1 week)',
    since_hours: 17280, // 720 * 24
    agg_minutes: 10080, // 7 * 24 * 60
  },
  {
    id: '1080d',
    label: 'Last 1080 days (1 week)',
    since_hours: 25920, // 1080 * 24
    agg_minutes: 10080, // 7 * 24 * 60
  },
];

/**
 * Default time range for charts
 */
export const DEFAULT_TIME_RANGE_ID = '24h';

/**
 * Get time range configuration by ID
 */
export function getTimeRangeById(id: string): TimeRangeConfig | undefined {
  return TIME_RANGES.find((tr) => tr.id === id);
}

/**
 * Get time range configuration by ID with fallback to default
 */
export function getTimeRangeByIdOrDefault(id: string): TimeRangeConfig {
  return getTimeRangeById(id) || getTimeRangeById(DEFAULT_TIME_RANGE_ID)!;
}
