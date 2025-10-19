export type SensorType = 'indoor' | 'outdoor' | 'mobile';

export type ParameterType = 'temperature' | 'humidity' | 'co2' | 'pm1' | 'pm25' | 'pm10' | 'tvoc';

export type SensorStatus = 'online' | 'offline';

export type AirQualityLevel = 'good' | 'moderate' | 'unhealthy' | 'hazardous';

export type SensorData = {
  id: string;
  code?: string; // Sensor code for API calls (e.g., "airgradient:744dbdbfdaac")
  name: string;
  type: SensorType;
  status: SensorStatus;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  co2: number;
  pm1?: number;
  pm25: number;
  pm10: number;
  tvoc: number;
  timestamp: string;
  lastUpdate?: string; // Last update timestamp
  // Additional metadata for table view
  serialNumber?: string;
  maker?: string;
  model?: string;
  commissioningDate?: string;
  calibrationInfo?: CalibrationInfo;
  channel?: string; // Sensor channel
};

export type CalibrationInfo = {
  pm25Methods: string[];
  pm10Methods?: string[];
  notes?: string;
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
