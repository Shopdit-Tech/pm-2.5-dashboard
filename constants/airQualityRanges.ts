import { ColorRange, ParameterType } from '@/types/sensor';

export const PM25_COLOR_RANGES: ColorRange[] = [
  { min: 0, max: 12, color: '#52c41a', level: 'good' }, // Green
  { min: 12.1, max: 35.4, color: '#faad14', level: 'moderate' }, // Yellow
  { min: 35.5, max: 55.4, color: '#fa8c16', level: 'unhealthy' }, // Orange
  { min: 55.5, max: 999, color: '#f5222d', level: 'hazardous' }, // Red
];

export const PM10_COLOR_RANGES: ColorRange[] = [
  { min: 0, max: 54, color: '#52c41a', level: 'good' },
  { min: 54.1, max: 154, color: '#faad14', level: 'moderate' },
  { min: 154.1, max: 254, color: '#fa8c16', level: 'unhealthy' },
  { min: 254.1, max: 999, color: '#f5222d', level: 'hazardous' },
];

export const PM1_COLOR_RANGES: ColorRange[] = [
  { min: 0, max: 10, color: '#52c41a', level: 'good' },
  { min: 10.1, max: 25, color: '#faad14', level: 'moderate' },
  { min: 25.1, max: 40, color: '#fa8c16', level: 'unhealthy' },
  { min: 40.1, max: 999, color: '#f5222d', level: 'hazardous' },
];

export const CO2_COLOR_RANGES: ColorRange[] = [
  { min: 0, max: 800, color: '#52c41a', level: 'good' },
  { min: 800.1, max: 1000, color: '#faad14', level: 'moderate' },
  { min: 1000.1, max: 1500, color: '#fa8c16', level: 'unhealthy' },
  { min: 1500.1, max: 9999, color: '#f5222d', level: 'hazardous' },
];

export const TVOC_COLOR_RANGES: ColorRange[] = [
  { min: 0, max: 220, color: '#52c41a', level: 'good' },
  { min: 220.1, max: 660, color: '#faad14', level: 'moderate' },
  { min: 660.1, max: 2200, color: '#fa8c16', level: 'unhealthy' },
  { min: 2200.1, max: 9999, color: '#f5222d', level: 'hazardous' },
];

export const TEMPERATURE_COLOR_RANGES: ColorRange[] = [
  { min: -50, max: 18, color: '#1890ff', level: 'good' }, // Cold
  { min: 18.1, max: 26, color: '#52c41a', level: 'good' }, // Comfortable
  { min: 26.1, max: 32, color: '#faad14', level: 'moderate' }, // Warm
  { min: 32.1, max: 100, color: '#f5222d', level: 'hazardous' }, // Hot
];

export const HUMIDITY_COLOR_RANGES: ColorRange[] = [
  { min: 0, max: 30, color: '#faad14', level: 'moderate' }, // Too dry
  { min: 30.1, max: 60, color: '#52c41a', level: 'good' }, // Comfortable
  { min: 60.1, max: 80, color: '#fa8c16', level: 'unhealthy' }, // Humid
  { min: 80.1, max: 100, color: '#f5222d', level: 'hazardous' }, // Too humid
];

export const PARAMETER_COLOR_RANGES: Record<ParameterType, ColorRange[]> = {
  pm25: PM25_COLOR_RANGES,
  pm10: PM10_COLOR_RANGES,
  pm1: PM1_COLOR_RANGES,
  co2: CO2_COLOR_RANGES,
  tvoc: TVOC_COLOR_RANGES,
  temperature: TEMPERATURE_COLOR_RANGES,
  humidity: HUMIDITY_COLOR_RANGES,
};

export const PARAMETER_UNITS: Record<ParameterType, string> = {
  temperature: '°C',
  humidity: '%',
  co2: 'ppm',
  pm1: 'µg/m³',
  pm25: 'µg/m³',
  pm10: 'µg/m³',
  tvoc: 'ppb',
};

export const PARAMETER_LABELS: Record<ParameterType, string> = {
  temperature: 'อุณหภูมิ',
  humidity: 'ความชื้นสัมพัทธ์',
  co2: 'คาร์บอนไดออกไซด์',
  pm1: 'ฝุ่น PM1',
  pm25: 'ฝุ่น PM2.5',
  pm10: 'ฝุ่น PM10',
  tvoc: 'TVOC',
};
