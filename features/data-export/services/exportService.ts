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

  // Calculate since_hours from date range
  const now = new Date();
  const hoursSinceStart = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60));

  try {
    // Fetch historical data from API
    const response = await getSensorHistory({
      sensor_code: sensor.code!,
      metric: 'All',
      since_hours: hoursSinceStart,
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
    return rowsToCSV(rows);
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
          temperature: null,
          humidity: null,
          tvoc_raw_logr: null,
          tvoc_index: null,
          nox_index: null,
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
      } else if (metricName === 'temperature') {
        dataByTimestamp[timestamp].temperature = point.value;
      } else if (metricName === 'humidity') {
        dataByTimestamp[timestamp].humidity = point.value;
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

    // Calculate heat index
    const heatIndex = calculateHeatIndex(data.temperature, data.humidity);

    // Format datetime in local timezone (+07:00 for Thailand)
    const localDateTime = formatLocalDateTime(date);
    const utcDateTime = date.toISOString();

    return {
      locationId: sensor.id || '-',
      locationName: sensor.name || '-',
      locationGroup: '-', // Not available in API
      locationType: sensor.type || 'Indoor',
      sensorId: sensor.code || '-',
      placeOpen: 'false',
      localDateTime,
      utcDateTime,
      aggregatedRecords: '1', // Could be enhanced if API provides this
      pm25Raw: formatValue(data.pm25),
      pm25Corrected: formatValue(data.pm25), // No correction available
      particleCount: formatValue(data.particle_0p3), // NOW AVAILABLE from API
      co2Raw: formatValue(data.co2_ppm), // Fixed metric name
      co2Corrected: formatValue(data.co2_ppm), // No correction available
      temperatureRaw: formatValue(data.temperature),
      temperatureCorrected: formatValue(data.temperature), // No correction available
      heatIndex: formatHeatIndex(heatIndex),
      humidityRaw: formatValue(data.humidity),
      humidityCorrected: formatValue(data.humidity), // No correction available
      tvoc: formatValue(data.tvoc_raw_logr), // Using raw log value (best available)
      tvocIndex: formatValue(data.tvoc_index), // NOW AVAILABLE from API
      noxIndex: formatValue(data.nox_index), // NOW AVAILABLE from API
      pm1: formatValue(data.pm1),
      pm10: formatValue(data.pm10),
    };
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
function rowsToCSV(rows: CSVRow[]): string {
  // CSV Header
  const headers = [
    'Location ID',
    'Location Name',
    'Location Group',
    'Location Type',
    'Sensor ID',
    'Place Open',
    'Local Date/Time',
    'UTC Date/Time',
    '# of aggregated records',
    'PM2.5 (μg/m³) raw',
    'PM2.5 (μg/m³) corrected',
    '0.3μm particle count',
    'CO2 (ppm) raw',
    'CO2 (ppm) corrected',
    'Temperature (°C) raw',
    'Temperature (°C) corrected',
    'Heat Index (°C)',
    'Humidity (%) raw',
    'Humidity (%) corrected',
    'TVOC (ppb)',
    'TVOC index',
    'NOX index',
    'PM1 (μg/m³)',
    'PM10 (μg/m³)',
  ];

  // Build CSV content
  const csvLines: string[] = [];

  // Add header
  csvLines.push(headers.map((h) => escapeCSVField(h)).join(','));

  // Add data rows
  rows.forEach((row) => {
    const values = [
      row.locationId,
      row.locationName,
      row.locationGroup,
      row.locationType,
      row.sensorId,
      row.placeOpen,
      row.localDateTime,
      row.utcDateTime,
      row.aggregatedRecords,
      row.pm25Raw,
      row.pm25Corrected,
      row.particleCount,
      row.co2Raw,
      row.co2Corrected,
      row.temperatureRaw,
      row.temperatureCorrected,
      row.heatIndex,
      row.humidityRaw,
      row.humidityCorrected,
      row.tvoc,
      row.tvocIndex,
      row.noxIndex,
      row.pm1,
      row.pm10,
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
