import { getSensorHistory } from '@/services/sensorApi';
import type { ExportParams, CSVRow } from '../types/exportTypes';
import { calculateHeatIndex, formatHeatIndex } from '../utils/heatIndexCalculator';

/**
 * Generate CSV content from sensor data
 */
export async function generateCSV(params: ExportParams): Promise<string> {
  const { sensor, startDate, endDate, bucketSize } = params;

  console.log('📊 Generating CSV export:', {
    sensor: sensor.name,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    bucketSize: bucketSize.label,
  });

  try {
    // Fetch historical data from API using date range
    const response = await getSensorHistory({
      sensor_code: sensor.code!,
      metric: 'All',
      from: startDate.toISOString(),
      to: endDate.toISOString(),
      agg_minutes: bucketSize.agg_minutes,
    });

    console.log('✅ Fetched data:', {
      metrics: response.metrics.length,
      sampleMetric: response.metrics[0]?.metric,
      pointsCount: response.metrics[0]?.points?.length,
    });

    // Build CSV rows
    const rows = buildCSVRows(sensor, response.metrics, startDate, endDate);

    console.log(`📄 Generated ${rows.length} CSV rows`);

    // Convert to CSV string
    return rowsToCSV(rows, sensor.type);
  } catch (error) {
    console.error('❌ Error generating CSV:', error);
    throw new Error('Failed to generate CSV export');
  }
}

/**
 * Build CSV rows from API metrics data
 */
function buildCSVRows(
  sensor: any,
  metrics: any[],
  startDate: Date,
  endDate: Date
): CSVRow[] {
  // Create a map of timestamp -> all metric values
  const dataByTimestamp: Record<string, any> = {};

  // Process each metric
  metrics.forEach((metricData) => {
    metricData.points?.forEach((point: any) => {
      const timestamp = point.ts;
      const pointDate = new Date(timestamp);

      // Filter by date range
      if (pointDate < startDate || pointDate > endDate) {
        return;
      }

      if (!dataByTimestamp[timestamp]) {
        dataByTimestamp[timestamp] = {
          timestamp,
          pm1: null,
          pm25: null,
          pm10: null,
          particle_0p3: null,
          co2_ppm: null,
          temperature_c: null,
          humidity_rh: null,
          tvoc_ppb: null,
          tvoc_raw_logr: null,
          tvoc_index: null,
          nox_index: null,
          lat: point.lat || null,
          lng: point.lng || null,
        };
      }

      // Map metric to field - using actual API metric names
      const metricName = metricData.metric.toLowerCase();
      if (metricName === 'pm1' || metricName === 'pm25' || metricName === 'pm10') {
        dataByTimestamp[timestamp][metricName] = point.value;
      } else if (metricName === 'particle_0p3') {
        dataByTimestamp[timestamp].particle_0p3 = point.value;
      } else if (metricName === 'co2_ppm') {
        dataByTimestamp[timestamp].co2_ppm = point.value;
      } else if (metricName === 'temperature_c') {
        dataByTimestamp[timestamp].temperature_c = point.value;
      } else if (metricName === 'humidity_rh') {
        dataByTimestamp[timestamp].humidity_rh = point.value;
      } else if (metricName === 'tvoc_ppb') {
        dataByTimestamp[timestamp].tvoc_ppb = point.value;
      } else if (metricName === 'tvoc_raw_logr') {
        dataByTimestamp[timestamp].tvoc_raw_logr = point.value;
      } else if (metricName === 'tvoc_index') {
        dataByTimestamp[timestamp].tvoc_index = point.value;
      } else if (metricName === 'nox_index') {
        dataByTimestamp[timestamp].nox_index = point.value;
      }
    });
  });

  // Convert to CSV rows
  const timestamps = Object.keys(dataByTimestamp).sort();
  const rows: CSVRow[] = timestamps.map((timestamp) => {
    const data = dataByTimestamp[timestamp];
    const date = new Date(timestamp);

    // Calculate heat index using correct field names
    const heatIndex = calculateHeatIndex(data.temperature_c, data.humidity_rh);

    // Format datetime in local timezone (+07:00 for Thailand)
    const localDateTime = formatLocalDateTime(date);
    const utcDateTime = date.toISOString();

    const baseRow = {
      locationName: sensor.name || '-',
      locationType: sensor.type || 'Indoor',
      sensorId: sensor.code || '-',
      localDateTime,
      utcDateTime,
      pm25Raw: formatValue(data.pm25),
      pm25Corrected: formatValue(data.pm25), // No correction available
      co2Raw: formatValue(data.co2_ppm),
      co2Corrected: formatValue(data.co2_ppm), // No correction available
      temperatureRaw: formatValue(data.temperature_c), // Fixed: use temperature_c
      temperatureCorrected: formatValue(data.temperature_c), // Fixed: use temperature_c
      heatIndex: formatHeatIndex(heatIndex),
      humidityRaw: formatValue(data.humidity_rh), // Fixed: use humidity_rh
      humidityCorrected: formatValue(data.humidity_rh), // Fixed: use humidity_rh
      tvoc: formatValue(data.tvoc_ppb), // Fixed: use tvoc_ppb (actual ppb value)
      tvocIndex: formatValue(data.tvoc_index),
      pm1: formatValue(data.pm1),
      pm10: formatValue(data.pm10),
    };

    // Add lat/lng for mobile sensors
    if (sensor.type === 'mobile') {
      return {
        ...baseRow,
        latitude: formatValue(data.lat),
        longitude: formatValue(data.lng),
      };
    }

    return baseRow;
  });

  return rows;
}

/**
 * Format datetime to local timezone (Thailand +07:00)
 */
function formatLocalDateTime(date: Date): string {
  // Add 7 hours for Thailand timezone
  const localDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');
  const hours = String(localDate.getUTCHours()).padStart(2, '0');
  const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(localDate.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format value for CSV (use "-" for null/undefined)
 */
function formatValue(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '-';
  }
  return String(value);
}

/**
 * Convert rows to CSV string
 */
function rowsToCSV(rows: CSVRow[], sensorType?: string): string {
  // CSV Header
  const headers = [
    'Location Name',
    'Location Type',
    'Sensor ID',
    'Local Date/Time',
    'UTC Date/Time',
    'PM2.5 (μg/m³) raw',
    'PM2.5 (μg/m³) corrected',
    'CO₂ (ppm) raw',
    'CO₂ (ppm) corrected',
    'Temperature (°C) raw',
    'Temperature (°C) corrected',
    'Heat Index (°C)',
    'Humidity (%) raw',
    'Humidity (%) corrected',
    'TVOC (ppb)',
    'TVOC index',
    'PM1 (μg/m³)',
    'PM10 (μg/m³)',
  ];

  // Add lat/lng headers for mobile sensors
  if (sensorType === 'mobile') {
    headers.push('Latitude', 'Longitude');
  }

  // Build CSV content
  const csvLines: string[] = [];

  // Add header
  csvLines.push(headers.map((h) => escapeCSVField(h)).join(','));

  // Add data rows
  rows.forEach((row) => {
    const values = [
      row.locationName,
      row.locationType,
      row.sensorId,
      row.localDateTime,
      row.utcDateTime,
      row.pm25Raw,
      row.pm25Corrected,
      row.co2Raw,
      row.co2Corrected,
      row.temperatureRaw,
      row.temperatureCorrected,
      row.heatIndex,
      row.humidityRaw,
      row.humidityCorrected,
      row.tvoc,
      row.tvocIndex,
      row.pm1,
      row.pm10,
      // Add lat/lng for mobile sensors
      ...(sensorType === 'mobile' ? [row.latitude || '-', row.longitude || '-'] : []),
    ];

    csvLines.push(values.map((v) => escapeCSVField(v)).join(','));
  });

  return csvLines.join('\n');
}

/**
 * Escape CSV field (handle quotes and commas)
 */
function escapeCSVField(field: string): string {
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Generate filename for export
 */
export function generateFilename(sensorName: string, startDate: Date, endDate: Date): string {
  const sanitizedName = sensorName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  return `sensor-export-${sanitizedName}-${start}-to-${end}.csv`;
}
