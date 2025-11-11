import type { SensorData } from '@/types/sensor';

export type BucketSize = 
  | 'unbucketed'
  | '5min'
  | '10min'
  | '30min'
  | '1hour'
  | '1day'
  | '1week'
  | '30day'
  | '1year';

export type BucketConfig = {
  id: BucketSize;
  label: string;
  agg_minutes: number;
};

export type ExportFormData = {
  sensorId: string;
  bucketSize: BucketSize;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
};

export type CSVRow = {
  locationId: string;
  locationName: string;
  locationGroup: string;
  locationType: string;
  sensorId: string;
  placeOpen: string;
  localDateTime: string;
  utcDateTime: string;
  aggregatedRecords: string;
  pm25Raw: string;
  pm25Corrected: string;
  particleCount: string;
  co2Raw: string;
  co2Corrected: string;
  temperatureRaw: string;
  temperatureCorrected: string;
  heatIndex: string;
  humidityRaw: string;
  humidityCorrected: string;
  tvoc: string;
  tvocIndex: string;
  noxIndex: string;
  pm1: string;
  pm10: string;
  latitude?: string; // Optional: only for mobile sensors
  longitude?: string; // Optional: only for mobile sensors
};

export type ExportParams = {
  sensor: SensorData;
  startDate: Date;
  endDate: Date;
  bucketSize: BucketConfig;
};
