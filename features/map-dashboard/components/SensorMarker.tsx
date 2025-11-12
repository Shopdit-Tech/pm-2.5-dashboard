import { SensorData } from '@/types/sensor';
import { getParameterColor } from '@/utils/airQualityUtils';
import { Popover, Badge } from 'antd';

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

  // Calculate AQI TH from PM2.5 (simplified Thailand AQI calculation)
  const calculateAQITH = (pm25: number): number => {
    if (pm25 <= 15) return Math.round((pm25 / 15) * 25);
    if (pm25 <= 25) return Math.round(25 + ((pm25 - 15) / 10) * 25);
    if (pm25 <= 37.5) return Math.round(50 + ((pm25 - 25) / 12.5) * 25);
    if (pm25 <= 75) return Math.round(75 + ((pm25 - 37.5) / 37.5) * 25);
    return Math.min(Math.round(100 + ((pm25 - 75) / 75) * 100), 200);
  };

  // Format timestamp to Thai format
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543; // Thai Buddhist year
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} พ.ย. ${year} ${hours}:${minutes} น.`;
  };

  // Tooltip content
  const tooltipContent = (
    <div style={{ maxWidth: 320 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
          {sensor.name}
        </div>
        <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 8 }}>
          {sensor.type === 'indoor' ? 'เซ็นเซอร์ภายในอาคาร' : 'เซ็นเซอร์ภายนอกอาคาร'}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Badge color={color} />
        <span style={{ fontWeight: 500 }}>
          PM2.5: {sensor.pm25.toFixed(1)} μg/m³ | AQI TH: {calculateAQITH(sensor.pm25)}
        </span>
      </div>
      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
        <div style={{ marginBottom: 2 }}>ค่าอากาศจากศูนยกลาง</div>
        <div>อัพเดทล่าสุด: {formatTimestamp(sensor.timestamp)}</div>
      </div>
    </div>
  );

  return (
    <Popover
      content={tooltipContent}
      trigger="hover"
      placement="top"
      overlayStyle={{ maxWidth: 350 }}
    >
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
            border: `2px solid ${isSelected ? '#1890ff' : 'black'}`,
            boxShadow: isSelected
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {/* PM2.5 Value */}
          <div className="text-white text-xs font-bold leading-none">
            {isOffline ? '-' : sensor.pm25.toFixed(0)}
          </div>
        </div>

        {/* Indoor/Outdoor Icon Badge */}
        {/* <div
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
        </div> */}
      </div>

      {/* Location Name Label */}
      {/* <div
        className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 text-xs font-medium rounded shadow-md"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          color: 'white',
          fontSize: '10px',
        }}
      >
        {sensor.name}
      </div> */}

        {/* Offline Indicator */}
        {isOffline && (
          <div
            className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white"
            style={{ backgroundColor: '#ff4d4f' }}
            title="ออฟไลน์"
          />
        )}
      </div>
    </Popover>
  );
};
