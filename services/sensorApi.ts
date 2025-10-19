import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type {
  ApiSensorsLatestResponse,
  ApiSensorHistoryResponse,
  SensorHistoryParams,
} from '@/types/api';

/**
 * Get latest readings for all sensors
 * @param movable - Filter by movable sensors (true/false)
 */
export const getLatestSensors = async (movable: boolean): Promise<ApiSensorsLatestResponse> => {
  try {
    const response = await apiClient.get<ApiSensorsLatestResponse>(
      API_ENDPOINTS.sensorsLatest,
      {
        params: { movable },
      }
    );
    
    console.log(`📊 Fetched ${response.data.count} sensors (movable: ${movable})`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch latest sensors:', error);
    throw error;
  }
};

/**
 * Get historical data for a specific sensor
 * @param params - History query parameters
 */
export const getSensorHistory = async (
  params: SensorHistoryParams
): Promise<ApiSensorHistoryResponse> => {
  try {
    const response = await apiClient.get<ApiSensorHistoryResponse>(
      API_ENDPOINTS.sensorHistory,
      {
        params: {
          sensor_code: params.sensor_code,
          metric: params.metric,
          since_hours: params.since_hours,
          agg_minutes: params.agg_minutes,
        },
      }
    );
    
    console.log(
      `📈 Fetched history for ${params.sensor_code}: ${response.data.metrics.length} metrics`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sensor history:', error);
    throw error;
  }
};

/**
 * Get latest readings for all static sensors (movable=false)
 */
export const getStaticSensors = () => getLatestSensors(false);

/**
 * Get latest readings for all mobile sensors (movable=true)
 */
export const getMobileSensors = () => getLatestSensors(true);
