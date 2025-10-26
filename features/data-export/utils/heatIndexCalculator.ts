/**
 * Calculate Heat Index from temperature and humidity
 * Based on the National Weather Service formula
 * 
 * @param tempCelsius - Temperature in Celsius
 * @param humidity - Relative humidity in percentage (0-100)
 * @returns Heat Index in Celsius, or null if calculation not applicable
 */
export function calculateHeatIndex(
  tempCelsius: number | null,
  humidity: number | null
): number | null {
  if (tempCelsius === null || humidity === null) {
    return null;
  }

  // Convert Celsius to Fahrenheit
  const tempF = (tempCelsius * 9/5) + 32;

  // Heat Index is only meaningful above 80°F (26.7°C)
  if (tempF < 80) {
    // For lower temperatures, just return the temperature
    return tempCelsius;
  }

  // Full Heat Index formula (Rothfusz regression)
  const c1 = -42.379;
  const c2 = 2.04901523;
  const c3 = 10.14333127;
  const c4 = -0.22475541;
  const c5 = -0.00683783;
  const c6 = -0.05481717;
  const c7 = 0.00122874;
  const c8 = 0.00085282;
  const c9 = -0.00000199;

  const T = tempF;
  const RH = humidity;

  let HI = c1 
    + (c2 * T) 
    + (c3 * RH) 
    + (c4 * T * RH) 
    + (c5 * T * T) 
    + (c6 * RH * RH) 
    + (c7 * T * T * RH) 
    + (c8 * T * RH * RH) 
    + (c9 * T * T * RH * RH);

  // Apply adjustments for low humidity
  if (RH < 13 && T >= 80 && T <= 112) {
    const adjustment = ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    HI -= adjustment;
  }

  // Apply adjustments for high humidity
  if (RH > 85 && T >= 80 && T <= 87) {
    const adjustment = ((RH - 85) / 10) * ((87 - T) / 5);
    HI += adjustment;
  }

  // Convert back to Celsius
  const heatIndexC = (HI - 32) * 5/9;

  return Math.round(heatIndexC * 10) / 10; // Round to 1 decimal place
}

/**
 * Format heat index for CSV output
 */
export function formatHeatIndex(heatIndex: number | null): string {
  if (heatIndex === null) {
    return '-';
  }
  return heatIndex.toFixed(1);
}
