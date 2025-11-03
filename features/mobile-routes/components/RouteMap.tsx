import { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import GoogleMapReact from 'google-map-react';
import { MobileRoute, RoutePoint } from '@/types/route';
import { getRouteCenter, calculateZoom, getRouteSegments } from '../utils/routeUtils';
import { SensorInfoWindow } from '@/features/map-dashboard/components/SensorInfoWindow';
import type { SensorData } from '@/types/sensor';

// Convert RoutePoint to SensorData format
const convertRoutePointToSensor = (point: RoutePoint, routeName: string): SensorData => ({
  id: point.id,
  name: `${routeName} - Point`,
  type: 'mobile' as const,
  status: 'online' as const,
  latitude: point.latitude,
  longitude: point.longitude,
  temperature: point.temperature,
  humidity: point.humidity,
  co2: point.co2,
  pm1: point.pm1,
  pm25: point.pm25,
  pm10: point.pm10,
  tvoc: point.tvoc,
  timestamp: point.timestamp,
});

type RouteMapProps = {
  route: MobileRoute;
  currentPointIndex?: number;
  onPointClick?: (point: RoutePoint) => void;
};

// Marker components for google-map-react
// IMPORTANT: Do NOT destructure lat/lng props - google-map-react needs them in the props object
type StartMarkerProps = {
  lat: number;
  lng: number;
  onClick?: () => void;
};

const StartMarker = ({ onClick }: StartMarkerProps) => (
  <div
    style={{
      position: 'absolute',
      transform: 'translate(-50%, -100%)',
      cursor: onClick ? 'pointer' : 'default',
    }}
    onClick={onClick}
  >
    <div
      style={{
        width: '32px',
        height: '32px',
        backgroundColor: '#52c41a',
        borderRadius: '50%',
        border: '3px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      S
    </div>
  </div>
);

type EndMarkerProps = {
  lat: number;
  lng: number;
  onClick?: () => void;
};

const EndMarker = ({ onClick }: EndMarkerProps) => (
  <div
    style={{
      position: 'absolute',
      transform: 'translate(-50%, -100%)',
      cursor: onClick ? 'pointer' : 'default',
    }}
    onClick={onClick}
  >
    <div
      style={{
        width: '32px',
        height: '32px',
        backgroundColor: '#ff4d4f',
        borderRadius: '50%',
        border: '3px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      E
    </div>
  </div>
);

type CurrentMarkerProps = {
  lat: number;
  lng: number;
  pm25: number;
  onClick?: () => void;
};

const CurrentMarker = ({ pm25, onClick }: CurrentMarkerProps) => (
  <div
    style={{
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      cursor: onClick ? 'pointer' : 'default',
    }}
    onClick={onClick}
  >
    <div
      style={{
        width: '48px',
        height: '48px',
        backgroundColor: '#1890ff',
        borderRadius: '50%',
        border: '4px solid white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '10px',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        animation: 'pulse 2s infinite',
      }}
    >
      <div style={{ fontSize: '14px' }}>{pm25.toFixed(0)}</div>
      <div style={{ fontSize: '8px' }}>PM2.5</div>
    </div>
  </div>
);

export const RouteMap = ({ route, currentPointIndex, onPointClick }: RouteMapProps) => {
  const mapRef = useRef<any>(null);
  const mapsRef = useRef<any>(null);
  const polylinesRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);

  const handlePointClick = (point: RoutePoint) => {
    console.log('✨ Point clicked:', point);
    setSelectedPoint(point);
    if (onPointClick) onPointClick(point);
  };

  // Safety check: ensure route has points
  if (!route || !route.points || route.points.length === 0) {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No route data available</p>
      </div>
    );
  }

  // Calculate display points based on playback
  const displayPoints = currentPointIndex !== undefined
    ? route.points.slice(0, currentPointIndex + 1)
    : route.points;

  // Memoize center and zoom to prevent constant recalculation
  const center = useMemo(() => getRouteCenter(displayPoints), [displayPoints.length]);
  const zoom = useMemo(() => calculateZoom(route.points), [route.points.length]);

  // Draw polylines when map loads or route/points change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !mapsRef.current) {
      console.log('🗺️ Waiting for map to load...');
      return;
    }

    if (displayPoints.length < 2) {
      console.log('🗺️ Not enough points to draw polylines');
      return;
    }

    console.log('🗺️ Drawing polylines for route:', route.id, '- Points:', displayPoints.length);

    // Clear old polylines
    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current = [];

    // Get colored segments
    const segments = getRouteSegments(displayPoints);

    // Draw each segment
    segments.forEach((segment) => {
      const polyline = new mapsRef.current.Polyline({
        path: [
          { lat: segment.start.latitude, lng: segment.start.longitude },
          { lat: segment.end.latitude, lng: segment.end.longitude },
        ],
        strokeColor: segment.color,
        strokeOpacity: 0.8,
        strokeWeight: 5,
        geodesic: true,
        clickable: true,
      });

      polyline.addListener('click', () => {
        handlePointClick(segment.start);
      });

      polyline.setMap(mapRef.current);
      polylinesRef.current.push(polyline);
    });

    console.log('✅ Drew', polylinesRef.current.length, 'polylines');

    // Cleanup
    return () => {
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current = [];
    };
  }, [mapLoaded, route.id, currentPointIndex]);

  const handleApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    console.log('✅ Google Map loaded!');
    mapRef.current = map;
    mapsRef.current = maps;
    setMapLoaded(true);
  };

  const startPoint = route.points[0];
  const endPoint = route.points[route.points.length - 1];
  const currentPoint = currentPointIndex !== undefined && displayPoints[currentPointIndex] 
    ? displayPoints[currentPointIndex] 
    : null;

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '' }}
        center={center}
        zoom={zoom}
        options={{
          zoomControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: false,
        }}
        onGoogleApiLoaded={handleApiLoaded}
        yesIWantToUseGoogleMapApiInternals
      >
        {/* Start marker */}
        {startPoint && (
          <StartMarker 
            lat={startPoint.latitude} 
            lng={startPoint.longitude}
            onClick={() => {
              console.log('🟢 Start marker clicked:', startPoint);
              handlePointClick(startPoint);
            }}
          />
        )}

        {/* End marker (only show if we've reached it or in full view) */}
        {endPoint && (currentPointIndex === undefined || currentPointIndex >= route.points.length - 1) && (
          <EndMarker 
            lat={endPoint.latitude} 
            lng={endPoint.longitude}
            onClick={() => {
              console.log('🔴 End marker clicked:', endPoint);
              handlePointClick(endPoint);
            }}
          />
        )}

        {/* Current position marker (during playback) */}
        {currentPoint && currentPointIndex !== undefined && (
          <CurrentMarker
            lat={currentPoint.latitude}
            lng={currentPoint.longitude}
            pm25={currentPoint.pm25}
            onClick={() => {
              console.log('🔵 Current marker clicked:', currentPoint);
              handlePointClick(currentPoint);
            }}
          />
        )}
      </GoogleMapReact>

      {/* Info Window Overlay - Use Portal to render in fullscreen element */}
      {selectedPoint && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
          onClick={() => setSelectedPoint(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <SensorInfoWindow
              sensor={convertRoutePointToSensor(selectedPoint, route.deviceName)}
              onClose={() => setSelectedPoint(null)}
            />
          </div>
        </div>,
        document.fullscreenElement || document.body
      )}

      {/* Add pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};
