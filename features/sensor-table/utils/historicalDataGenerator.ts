// Generate realistic historical data for sensor parameters

export type HistoricalDataPoint = {
  timestamp: string;
  value: number;
};

export type TimeRange = '6h' | '12h' | '24h' | '48h';

export function getTimeRangeHours(range: TimeRange): number {
  switch (range) {
    case '6h':
      return 6;
    case '12h':
      return 12;
    case '24h':
      return 24;
    case '48h':
      return 48;
  }
}

export function getTimeRangeLabel(range: TimeRange): string {
  switch (range) {
    case '6h':
      return 'Last 6 Hours';
    case '12h':
      return 'Last 12 Hours';
    case '24h':
      return 'Last 24 Hours';
    case '48h':
      return 'Last 48 Hours';
  }
}

/**
 * Generate historical data with realistic patterns
 * @param currentValue Current sensor value
 * @param parameter Parameter type (pm25, co2, etc.)
 * @param timeRange Time range to generate
 * @returns Array of historical data points
 */
export function generateHistoricalData(
  currentValue: number,
  parameter: string,
  timeRange: TimeRange = '48h'
): HistoricalDataPoint[] {
  const hours = getTimeRangeHours(timeRange);
  const pointsPerHour = 12; // 5-minute intervals
  const totalPoints = hours * pointsPerHour;
  const now = Date.now();
  const data: HistoricalDataPoint[] = [];

  // Base value (use 80% of current as average)
  const baseValue = currentValue * 0.85;

  for (let i = 0; i < totalPoints; i++) {
    const timestamp = new Date(now - (totalPoints - i) * 5 * 60 * 1000);
    const hourOfDay = timestamp.getHours();

    // Daily pattern varies by parameter
    let dailyFactor = 1.0;

    if (parameter === 'pm25' || parameter === 'pm10') {
      // PM levels: higher during rush hours (7-9am, 5-7pm), lower at night
      if ((hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 17 && hourOfDay <= 19)) {
        dailyFactor = 1.4 + Math.random() * 0.3; // Rush hour spikes
      } else if (hourOfDay >= 22 || hourOfDay <= 5) {
        dailyFactor = 0.6 + Math.random() * 0.2; // Night time low
      } else {
        dailyFactor = 0.9 + Math.random() * 0.4; // Day time variation
      }
    } else if (parameter === 'co2') {
      // CO2: higher when people are active (9am-5pm)
      if (hourOfDay >= 9 && hourOfDay <= 17) {
        dailyFactor = 1.2 + Math.random() * 0.3;
      } else if (hourOfDay >= 22 || hourOfDay <= 6) {
        dailyFactor = 0.7 + Math.random() * 0.2;
      } else {
        dailyFactor = 0.9 + Math.random() * 0.3;
      }
    } else if (parameter === 'temperature') {
      // Temperature: sinusoidal pattern, peak at 2pm
      const tempFactor = Math.sin(((hourOfDay - 6) / 24) * Math.PI * 2) * 0.3;
      dailyFactor = 1.0 + tempFactor;
    } else if (parameter === 'humidity') {
      // Humidity: inverse of temperature
      const humidityFactor = Math.sin(((hourOfDay - 18) / 24) * Math.PI * 2) * 0.25;
      dailyFactor = 1.0 + humidityFactor;
    } else {
      // Default: small random variation
      dailyFactor = 0.85 + Math.random() * 0.3;
    }

    // Add some random noise (±15%)
    const noise = (Math.random() - 0.5) * 0.3;

    // Occasional spikes (2% chance)
    const spike = Math.random() < 0.02 ? 1.5 + Math.random() * 0.5 : 1.0;

    // Calculate value with all factors
    let value = baseValue * dailyFactor * (1 + noise) * spike;

    // Ensure non-negative values
    value = Math.max(0, value);

    // Round based on parameter type
    if (parameter === 'co2' || parameter === 'tvoc') {
      value = Math.round(value);
    } else {
      value = Math.round(value * 10) / 10;
    }

    data.push({
      timestamp: timestamp.toISOString(),
      value,
    });
  }

  // Apply smoothing to avoid too much jumpiness
  return smoothData(data, 3);
}

/**
 * Simple moving average smoothing
 */
function smoothData(data: HistoricalDataPoint[], window: number): HistoricalDataPoint[] {
  if (data.length < window) return data;

  const smoothed: HistoricalDataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(window / 2));
    const end = Math.min(data.length, i + Math.ceil(window / 2));
    const windowData = data.slice(start, end);

    const average = windowData.reduce((sum, point) => sum + point.value, 0) / windowData.length;

    smoothed.push({
      timestamp: data[i].timestamp,
      value: average,
    });
  }

  return smoothed;
}

/**
 * Calculate statistics for historical data
 */
export function calculateStatistics(data: HistoricalDataPoint[]) {
  if (data.length === 0) {
    return { min: 0, max: 0, average: 0, current: 0 };
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const current = data[data.length - 1]?.value || 0;

  return { min, max, average, current };
}
