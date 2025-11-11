export type ThresholdMetric =
  | 'pm1'
  | 'pm25'
  | 'pm10'
  | 'co2_ppm'
  | 'tvoc_ppb'
  | 'temperature_c'
  | 'humidity_rh';

export type ThresholdLevel = 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export type Threshold = {
  id: string;
  metric: ThresholdMetric;
  level: ThresholdLevel;
  sort_order: number;
  color_hex: string;
  min_value: number;
  max_value: number;
  created_at: string;
};

export type GetThresholdsResponse = {
  items: Threshold[];
};

export type CreateThresholdRequest = {
  metric: ThresholdMetric;
  level: ThresholdLevel;
  sort_order: number;
  color_hex: string;
  min_value: number;
  max_value: number;
};

export type CreateThresholdResponse = {
  item: Threshold;
};

export type UpdateThresholdRequest = {
  id: string;
  color_hex?: string;
  min_value?: number;
  max_value?: number;
  level?: ThresholdLevel;
  sort_order?: number;
};

export type UpdateThresholdResponse = {
  item: Threshold;
};

export type DeleteThresholdRequest = {
  id: string;
};

export type DeleteThresholdResponse = {
  deleted_id: string;
};
