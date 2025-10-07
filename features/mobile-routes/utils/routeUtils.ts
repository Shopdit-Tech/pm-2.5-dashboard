import { RoutePoint } from '@/types/route';
import { getParameterColor } from '@/utils/airQualityUtils';

export type RouteSegment = {
  start: RoutePoint;
  end: RoutePoint;
  color: string;
};

/**
 * Split route into colored segments based on PM2.5 values
 */
export const getRouteSegments = (points: RoutePoint[]): RouteSegment[] => {
  const segments: RouteSegment[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const averagePm25 = (start.pm25 + end.pm25) / 2;
    const color = getParameterColor('pm25', averagePm25);
    
    segments.push({
      start,
      end,
      color,
    });
  }
  
  return segments;
};

/**
 * Calculate center point of route
 */
export const getRouteCenter = (points: RoutePoint[]): { lat: number; lng: number } => {
  if (points.length === 0) {
    return { lat: 13.7563, lng: 100.5018 }; // Bangkok default
  }
  
  const sumLat = points.reduce((sum, p) => sum + p.latitude, 0);
  const sumLng = points.reduce((sum, p) => sum + p.longitude, 0);
  
  return {
    lat: sumLat / points.length,
    lng: sumLng / points.length,
  };
};

/**
 * Calculate zoom level based on route bounds
 */
export const calculateZoom = (points: RoutePoint[]): number => {
  if (points.length === 0) return 12;
  
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  
  const maxLat = Math.max(...lats);
  const minLat = Math.min(...lats);
  const maxLng = Math.max(...lngs);
  const minLng = Math.min(...lngs);
  
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);
  
  // Rough zoom calculation
  if (maxDiff > 0.5) return 10;
  if (maxDiff > 0.2) return 11;
  if (maxDiff > 0.1) return 12;
  if (maxDiff > 0.05) return 13;
  return 14;
};

/**
 * Filter route points up to a specific time index
 */
export const getPointsUpToIndex = (points: RoutePoint[], index: number): RoutePoint[] => {
  return points.slice(0, index + 1);
};

/**
 * Format duration from milliseconds
 */
export const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
