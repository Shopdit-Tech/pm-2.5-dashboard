import { useEffect, useRef } from 'react';
import GoogleMapReact from 'google-map-react';
import { MobileRoute, RoutePoint } from '@/types/route';
import { getRouteCenter, calculateZoom, getRouteSegments } from '../utils/routeUtils';

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
};

const StartMarker = (_props: StartMarkerProps) => (
  <div
    style={{
      position: 'absolute',
      transform: 'translate(-50%, -100%)',
    }}
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
      }}
    >
      S
    </div>
  </div>
);

type EndMarkerProps = {
  lat: number;
  lng: number;
};

const EndMarker = (_props: EndMarkerProps) => (
  <div
    style={{
      position: 'absolute',
      transform: 'translate(-50%, -100%)',
    }}
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
};

const CurrentMarker = ({ pm25 }: CurrentMarkerProps) => (
  <div
    style={{
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
    }}
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

  // Safety check: ensure route has points
  if (!route || !route.points || route.points.length === 0) {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No route data available</p>
      </div>
    );
  }

  const displayPoints = currentPointIndex !== undefined
    ? route.points.slice(0, currentPointIndex + 1)
    : route.points;

  const center = getRouteCenter(displayPoints);
  const zoom = calculateZoom(route.points);

  // Draw polylines when map loads or points change
  useEffect(() => {
    if (!mapRef.current || !mapsRef.current || displayPoints.length < 2) return;

    // Clear previous polylines
    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current = [];

    // Get colored segments
    const segments = getRouteSegments(displayPoints);

    // Draw each segment with its color
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

      // Add click listener to polyline
      if (onPointClick) {
        polyline.addListener('click', () => {
          // When clicked, show details of the start point of this segment
          onPointClick(segment.start);
        });
      }

      polyline.setMap(mapRef.current);
      polylinesRef.current.push(polyline);
    });

    // Cleanup on unmount
    return () => {
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    };
  }, [displayPoints, onPointClick]);

  const handleApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    mapRef.current = map;
    mapsRef.current = maps;
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
          />
        )}

        {/* End marker (only show if we've reached it or in full view) */}
        {endPoint && (currentPointIndex === undefined || currentPointIndex >= route.points.length - 1) && (
          <EndMarker 
            lat={endPoint.latitude} 
            lng={endPoint.longitude}
          />
        )}

        {/* Current position marker (during playback) */}
        {currentPoint && currentPointIndex !== undefined && (
          <CurrentMarker
            lat={currentPoint.latitude}
            lng={currentPoint.longitude}
            pm25={currentPoint.pm25}
          />
        )}
      </GoogleMapReact>

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
