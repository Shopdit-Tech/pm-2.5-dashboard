import { MobileRoute, RoutePoint } from '@/types/route';

// Generate a route from point A to B with intermediate points
const generateRoute = (
  deviceId: string,
  deviceName: string,
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  numPoints: number,
  startTime: Date
): MobileRoute => {
  const points: RoutePoint[] = [];
  
  for (let i = 0; i < numPoints; i++) {
    const ratio = i / (numPoints - 1);
    const lat = startLat + (endLat - startLat) * ratio;
    const lng = startLng + (endLng - startLng) * ratio;
    
    // Add some randomness to the path
    const latOffset = (Math.random() - 0.5) * 0.005;
    const lngOffset = (Math.random() - 0.5) * 0.005;
    
    // Simulate PM2.5 variations along the route
    const basePm25 = 35;
    const variation = Math.sin(ratio * Math.PI * 2) * 20 + Math.random() * 15;
    const pm25 = Math.max(10, basePm25 + variation);
    
    const timestamp = new Date(startTime.getTime() + (i * 2 * 60 * 1000)); // 2 minutes apart
    
    points.push({
      id: `point-${i}`,
      latitude: lat + latOffset,
      longitude: lng + lngOffset,
      pm25: Number(pm25.toFixed(1)),
      pm10: Number((pm25 * 1.5).toFixed(1)),
      temperature: 32 + Math.random() * 3,
      humidity: 65 + Math.random() * 10,
      co2: 450 + Math.floor(Math.random() * 100),
      tvoc: 150 + Math.floor(Math.random() * 80),
      timestamp: timestamp.toISOString(),
      speed: 20 + Math.random() * 40, // 20-60 km/h
    });
  }
  
  const allPm25 = points.map((p) => p.pm25);
  const totalDistance = numPoints * 0.5; // Approximate distance in km
  
  return {
    id: `route-${deviceId}-${startTime.getTime()}`,
    deviceId,
    deviceName,
    startTime: points[0].timestamp,
    endTime: points[points.length - 1].timestamp,
    totalDistance: Number(totalDistance.toFixed(2)),
    averagePm25: Number((allPm25.reduce((a, b) => a + b, 0) / allPm25.length).toFixed(1)),
    maxPm25: Number(Math.max(...allPm25).toFixed(1)),
    minPm25: Number(Math.min(...allPm25).toFixed(1)),
    points,
  };
};

// Mock routes for testing
export const MOCK_ROUTES: MobileRoute[] = [
  // Route 1: Sukhumvit to Bang Na
  generateRoute(
    'mobile-001',
    'Mobile Device 1',
    13.7369, 100.5698, // Sukhumvit
    13.6689, 100.6408, // Bang Na
    50,
    new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  ),
  
  // Route 2: Siam to Chatuchak
  generateRoute(
    'mobile-002',
    'Mobile Device 2',
    13.7460, 100.5347, // Siam
    13.7996, 100.5520, // Chatuchak
    40,
    new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
  ),
  
  // Route 3: Sathorn to Ladprao
  generateRoute(
    'mobile-003',
    'Mobile Device 3',
    13.7245, 100.5285, // Sathorn
    13.7955, 100.6048, // Ladprao
    60,
    new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  ),
];
