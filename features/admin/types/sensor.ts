export type SensorType = 'INDOOR' | 'OUTDOOR' | 'MOBILE';

export type AdminSensor = {
  id: string;
  code: string;
  name: string | null;
  type: SensorType;
  model: string | null;
  is_movable: boolean;
  fixed_lat: number | null;
  fixed_lng: number | null;
  fixed_geom: any | null;
  address: string | null;
  meta: Record<string, any> | null;
  is_online: boolean;
  last_seen: string | null;
  created_at: string;
};

export type GetSensorsResponse = {
  sensors: AdminSensor[];
};

export type CreateSensorRequest = {
  code: string;
  name?: string;
  type: SensorType;
  model?: string;
  is_movable: boolean;
  fixed_lat?: number;
  fixed_lng?: number;
  address?: string;
  meta?: Record<string, any>;
};

export type CreateSensorResponse = {
  sensor: AdminSensor;
};

export type UpdateSensorRequest = {
  code: string;
  name?: string;
  type?: SensorType;
  is_movable?: boolean;
  fixed_lat?: number;
  fixed_lng?: number;
  address?: string;
  meta?: Record<string, any>;
};

export type UpdateSensorResponse = {
  sensor: AdminSensor;
};

export type DeleteSensorResponse = {
  deleted_id: string;
};
