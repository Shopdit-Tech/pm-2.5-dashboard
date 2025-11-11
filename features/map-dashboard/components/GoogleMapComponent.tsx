import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import GoogleMapReact from 'google-map-react';
import { Modal } from 'antd';
import { SensorData } from '@/types/sensor';
import { SensorMarker } from './SensorMarker';
import { SensorInfoWindow } from './SensorInfoWindow';

type GoogleMapComponentProps = {
  sensors: SensorData[];
  center?: { lat: number; lng: number };
  zoom?: number;
  selectedSensorId?: string | null;
};

// Default center: Bangkok, Thailand
const defaultCenter = {
  lat: 13.7563,
  lng: 100.5018,
};

// Wrapper component for markers (required by google-map-react)
type MarkerWrapperProps = {
  lat: number;
  lng: number;
  sensor: SensorData;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

const MarkerWrapper = ({ sensor, isSelected, onClick, onMouseEnter, onMouseLeave }: MarkerWrapperProps) => {
  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <SensorMarker sensor={sensor} isSelected={isSelected} onClick={onClick} />
    </div>
  );
};


export const GoogleMapComponent = ({
  sensors,
  center = defaultCenter,
  zoom = 11,
  selectedSensorId: externalSelectedSensorId,
}: GoogleMapComponentProps) => {
  // Store only IDs to avoid stale sensor objects
  const [internalSelectedSensorId, setInternalSelectedSensorId] = useState<string | null>(null);
  const [hoveredSensorId, setHoveredSensorId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const mapRef = useRef<any>(null);
  
  // Use only internal for modal/highlighting (clicking markers)
  const selectedSensorId = internalSelectedSensorId;
  
  // Center map on selected sensor when it changes
  useEffect(() => {
    if (externalSelectedSensorId) {
      const sensor = sensors.find(s => s.id === externalSelectedSensorId);
      if (sensor) {
        setMapCenter({ lat: sensor.latitude, lng: sensor.longitude });
        setMapZoom(15);
        // Close any open modal - only center the map, don't open modal
        setInternalSelectedSensorId(null);
      }
    } else {
      // Reset zoom when selection is cleared
      setMapCenter(center);
      setMapZoom(zoom);
    }
  }, [externalSelectedSensorId, sensors, center, zoom]);

  console.log('📍 Sensors to render:', sensors.length);
  console.log('🔑 API Key exists:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  // Find the actual sensor objects from IDs using latest sensors array
  const selectedSensor = useMemo(
    () => sensors.find((s) => s.id === selectedSensorId),
    [sensors, selectedSensorId]
  );

  const hoveredSensor = useMemo(
    () => sensors.find((s) => s.id === hoveredSensorId),
    [sensors, hoveredSensorId]
  );

  // Memoized click handler
  const handleMarkerClick = useCallback((sensorId: string, sensorName: string) => {
    console.log('🖱️ Marker clicked:', sensorName, 'ID:', sensorId);
    setInternalSelectedSensorId(sensorId);
  }, []);

  // Memoized close handler
  const handleModalClose = useCallback(() => {
    console.log('❌ Closing modal');
    setInternalSelectedSensorId(null);
  }, []);

  // Memoized hover handlers
  const handleMouseEnter = useCallback((sensorId: string) => {
    setHoveredSensorId(sensorId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredSensorId(null);
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '' }}
        center={mapCenter}
        zoom={mapZoom}
        options={{
          zoomControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
        onClick={() => setInternalSelectedSensorId(null)}
        onGoogleApiLoaded={({ map }) => {
          mapRef.current = map;
        }}
        yesIWantToUseGoogleMapApiInternals
      >
        {/* Render all sensor markers */}
        {sensors.map((sensor) => {
          console.log('🎯 Rendering marker:', sensor.name);
          return (
            <MarkerWrapper
              key={sensor.id}
              lat={sensor.latitude}
              lng={sensor.longitude}
              sensor={sensor}
              isSelected={selectedSensorId === sensor.id || hoveredSensorId === sensor.id}
              onClick={() => handleMarkerClick(sensor.id, sensor.name)}
              onMouseEnter={() => handleMouseEnter(sensor.id)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </GoogleMapReact>

      {/* Full Screen Modal for Sensor Details */}
      <Modal
        open={!!selectedSensorId}
        onCancel={handleModalClose}
        footer={null}
        closable={false}
        width="auto"
        style={{ 
          maxWidth: '95vw',
          top: typeof window !== 'undefined' && window.innerWidth < 768 ? undefined : 20,
        }}
        styles={{
          wrapper: {
            zIndex: 2000,
          },
          content: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
          }
        }}
        bodyStyle={{ padding: 0, display: 'flex', justifyContent: 'center', background: 'transparent' }}
        destroyOnClose
        centered
        zIndex={2000}
        getContainer={() => {
          // Render modal inside fullscreen element if map is fullscreen
          if (typeof document !== 'undefined' && document.fullscreenElement) {
            return document.fullscreenElement as HTMLElement;
          }
          return typeof document !== 'undefined' ? document.body : undefined as any;
        }}
      >
        {selectedSensor && (
          <SensorInfoWindow sensor={selectedSensor} onClose={handleModalClose} />
        )}
      </Modal>
    </div>
  );
};
