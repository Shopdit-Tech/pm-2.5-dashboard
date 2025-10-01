import { ColorRange, ParameterType, AirQualityLevel } from '@/types/sensor';
import { PARAMETER_COLOR_RANGES } from '@/constants/airQualityRanges';

export const getColorForValue = (value: number, ranges: ColorRange[]): string => {
  for (const range of ranges) {
    if (value >= range.min && value <= range.max) {
      return range.color;
    }
  }
  return ranges[ranges.length - 1].color; // Return last color as default (hazardous)
};

export const getLevelForValue = (value: number, ranges: ColorRange[]): AirQualityLevel => {
  for (const range of ranges) {
    if (value >= range.min && value <= range.max) {
      return range.level;
    }
  }
  return 'hazardous';
};

export const getParameterColor = (parameter: ParameterType, value: number): string => {
  const ranges = PARAMETER_COLOR_RANGES[parameter];
  return getColorForValue(value, ranges);
};

export const getParameterLevel = (parameter: ParameterType, value: number): AirQualityLevel => {
  const ranges = PARAMETER_COLOR_RANGES[parameter];
  return getLevelForValue(value, ranges);
};

export const formatParameterValue = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals);
};

export const getLevelLabel = (level: AirQualityLevel): string => {
  const labels: Record<AirQualityLevel, string> = {
    good: 'ดี',
    moderate: 'ปานกลาง',
    unhealthy: 'ไม่ดีต่อสุขภาพ',
    hazardous: 'อันตราย',
  };
  return labels[level];
};

export const getLevelColor = (level: AirQualityLevel): string => {
  const colors: Record<AirQualityLevel, string> = {
    good: '#52c41a',
    moderate: '#faad14',
    unhealthy: '#fa8c16',
    hazardous: '#f5222d',
  };
  return colors[level];
};
