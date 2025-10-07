export type RoutePoint = {
  id: string;
  latitude: number;
  longitude: number;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  co2: number;
  tvoc: number;
  timestamp: string;
  speed?: number; // km/h
};

export type MobileDevice = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  lastUpdate: string;
};

export type MobileRoute = {
  id: string;
  deviceId: string;
  deviceName: string;
  startTime: string;
  endTime: string;
  totalDistance: number; // km
  averagePm25: number;
  maxPm25: number;
  minPm25: number;
  points: RoutePoint[];
};
