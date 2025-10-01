export type SensorType = 'indoor' | 'outdoor' | 'mobile';

export type ParameterType = 'temperature' | 'humidity' | 'co2' | 'pm1' | 'pm25' | 'pm10' | 'tvoc';

export type SensorStatus = 'online' | 'offline';

export type AirQualityLevel = 'good' | 'moderate' | 'unhealthy' | 'hazardous';

export type SensorData = {
  id: string;
  name: string;
  type: SensorType;
  status: SensorStatus;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  co2: number;
  pm1?: number; // Only for mobile sensors
  pm25: number;
  pm10: number;
  tvoc: number;
  timestamp: string;
};

export type ColorRange = {
  min: number;
  max: number;
  color: string;
  level: AirQualityLevel;
};

export type ParameterConfig = {
  parameter: ParameterType;
  ranges: ColorRange[];
};
