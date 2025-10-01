import { SensorData } from '@/types/sensor';
import { getParameterColor } from '@/utils/airQualityUtils';
import { HomeOutlined, ShopOutlined } from '@ant-design/icons';

type SensorMarkerProps = {
  sensor: SensorData;
  onClick: () => void;
  isSelected: boolean;
};

export const SensorMarker = ({ sensor, onClick, isSelected }: SensorMarkerProps) => {
  const color = getParameterColor('pm25', sensor.pm25);
  const isOffline = sensor.status === 'offline';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling to map
    console.log('📍 SensorMarker clicked:', sensor.name);
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      className="relative cursor-pointer transform transition-all duration-200 hover:scale-110"
      style={{
        transform: isSelected ? 'scale(1.2)' : 'scale(1)',
      }}
    >
      {/* Marker Container */}
      <div className="relative">
        {/* Pulse effect for selected marker */}
        {isSelected && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              backgroundColor: color,
              opacity: 0.4,
              width: '48px',
              height: '48px',
              top: '-8px',
              left: '-8px',
            }}
          />
        )}

        {/* Main Marker Circle */}
        <div
          className="relative flex flex-col items-center justify-center shadow-lg"
          style={{
            width: '42px',
            height: '42px',
            backgroundColor: isOffline ? '#d9d9d9' : color,
            borderRadius: '50%',
            border: `3px solid ${isSelected ? '#1890ff' : 'white'}`,
            boxShadow: isSelected
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {/* PM2.5 Value */}
          <div className="text-white text-xs font-bold leading-none">
            {isOffline ? '-' : sensor.pm25.toFixed(0)}
          </div>
          <div className="text-white text-[8px] leading-none mt-0.5">PM2.5</div>
        </div>

        {/* Indoor/Outdoor Icon Badge */}
        <div
          className="absolute -bottom-1 -right-1 flex items-center justify-center"
          style={{
            width: '18px',
            height: '18px',
            backgroundColor: sensor.type === 'indoor' ? '#1890ff' : '#52c41a',
            borderRadius: '50%',
            border: '2px solid white',
          }}
        >
          {sensor.type === 'indoor' ? (
            <HomeOutlined style={{ fontSize: '8px', color: 'white' }} />
          ) : (
            <ShopOutlined style={{ fontSize: '8px', color: 'white' }} />
          )}
        </div>
      </div>

      {/* Location Name Label */}
      <div
        className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 text-xs font-medium rounded shadow-md"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          color: 'white',
          fontSize: '10px',
        }}
      >
        {sensor.name}
      </div>

      {/* Offline Indicator */}
      {isOffline && (
        <div
          className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white"
          style={{ backgroundColor: '#ff4d4f' }}
          title="ออฟไลน์"
        />
      )}
    </div>
  );
};
