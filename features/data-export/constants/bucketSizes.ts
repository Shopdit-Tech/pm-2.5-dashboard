import type { BucketConfig } from '../types/exportTypes';

/**
 * Bucket size configurations for data export aggregation
 */
export const BUCKET_SIZES: BucketConfig[] = [
  {
    id: '5min',
    label: '5 นาที',
    agg_minutes: 5,
  },
  {
    id: '10min',
    label: '10 นาที',
    agg_minutes: 10,
  },
  {
    id: '30min',
    label: '30 นาที',
    agg_minutes: 30,
  },
  {
    id: '1hour',
    label: '1 ชั่วโมง',
    agg_minutes: 60,
  },
  {
    id: '1day',
    label: '1 วัน',
    agg_minutes: 1440, // 24 * 60
  },
  {
    id: '1week',
    label: '1 สัปดาห์',
    agg_minutes: 10080, // 7 * 24 * 60
  },
  {
    id: '30day',
    label: '30 วัน',
    agg_minutes: 43200, // 30 * 24 * 60
  },
  {
    id: '1year',
    label: '1 ปี',
    agg_minutes: 525600, // 365 * 24 * 60
  },
];

/**
 * Get bucket config by ID
 */
export function getBucketSizeById(id: string): BucketConfig | undefined {
  return BUCKET_SIZES.find((b) => b.id === id);
}

/**
 * Default bucket size for exports
 */
export const DEFAULT_BUCKET_SIZE = '1hour';
