// Air quality thresholds for different parameters

export type QualityZone = {
  min: number;
  max: number;
  label: string;
  color: string;
  opacity: number;
};

export const PM25_ZONES: QualityZone[] = [
  { min: 0, max: 12, label: 'Good', color: '#52c41a', opacity: 0.15 },
  { min: 12, max: 35, label: 'Moderate', color: '#fadb14', opacity: 0.15 },
  { min: 35, max: 55, label: 'Unhealthy for Sensitive Groups', color: '#faad14', opacity: 0.15 },
  { min: 55, max: 150, label: 'Unhealthy', color: '#ff4d4f', opacity: 0.15 },
  { min: 150, max: 250, label: 'Very Unhealthy', color: '#722ed1', opacity: 0.15 },
  { min: 250, max: 500, label: 'Hazardous', color: '#a0202e', opacity: 0.15 },
];

export const PM10_ZONES: QualityZone[] = [
  { min: 0, max: 54, label: 'Good', color: '#52c41a', opacity: 0.15 },
  { min: 54, max: 154, label: 'Moderate', color: '#fadb14', opacity: 0.15 },
  { min: 154, max: 254, label: 'Unhealthy for Sensitive Groups', color: '#faad14', opacity: 0.15 },
  { min: 254, max: 354, label: 'Unhealthy', color: '#ff4d4f', opacity: 0.15 },
  { min: 354, max: 424, label: 'Very Unhealthy', color: '#722ed1', opacity: 0.15 },
  { min: 424, max: 604, label: 'Hazardous', color: '#a0202e', opacity: 0.15 },
];

export const CO2_ZONES: QualityZone[] = [
  { min: 0, max: 600, label: 'Good', color: '#52c41a', opacity: 0.15 },
  { min: 600, max: 1000, label: 'Moderate', color: '#fadb14', opacity: 0.15 },
  { min: 1000, max: 2000, label: 'Poor', color: '#faad14', opacity: 0.15 },
  { min: 2000, max: 5000, label: 'Very Poor', color: '#ff4d4f', opacity: 0.15 },
];

export const TVOC_ZONES: QualityZone[] = [
  { min: 0, max: 220, label: 'Good', color: '#52c41a', opacity: 0.15 },
  { min: 220, max: 660, label: 'Moderate', color: '#fadb14', opacity: 0.15 },
  { min: 660, max: 2200, label: 'Poor', color: '#faad14', opacity: 0.15 },
  { min: 2200, max: 10000, label: 'Very Poor', color: '#ff4d4f', opacity: 0.15 },
];

export function getZonesForParameter(parameter: string): QualityZone[] {
  switch (parameter) {
    case 'pm25':
      return PM25_ZONES;
    case 'pm10':
      return PM10_ZONES;
    case 'co2':
      return CO2_ZONES;
    case 'tvoc':
      return TVOC_ZONES;
    default:
      return [];
  }
}

export function getParameterLabel(parameter: string): string {
  switch (parameter) {
    case 'pm25':
      return 'PM₂.₅';
    case 'pm10':
      return 'PM₁₀';
    case 'co2':
      return 'CO₂';
    case 'temperature':
      return 'Temperature';
    case 'humidity':
      return 'Humidity';
    case 'tvoc':
      return 'TVOC';
    default:
      return parameter.toUpperCase();
  }
}

export function getParameterUnit(parameter: string): string {
  switch (parameter) {
    case 'pm25':
    case 'pm10':
      return 'μg/m³';
    case 'co2':
      return 'ppm';
    case 'temperature':
      return '°C';
    case 'humidity':
      return '%';
    case 'tvoc':
      return 'index';
    default:
      return '';
  }
}
