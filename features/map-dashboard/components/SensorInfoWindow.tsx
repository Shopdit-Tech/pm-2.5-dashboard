import { SensorData, ParameterType } from '@/types/sensor';
import {
  EnvironmentOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { getParameterColor, getParameterLevel } from '@/utils/airQualityUtils';

type SensorInfoWindowProps = {
  sensor: SensorData;
  onClose?: () => void;
};

// Circular Progress Component
const CircularProgress = ({ value, max, size = 145, strokeWidth = 18, color = '#52c41a' }: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f0f0f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-1">PM 2.5</div>
        <div className="text-4xl font-bold" style={{ color, lineHeight: '1.2' }}>
          {value.toFixed(1)}
        </div>
        <div className="text-xs text-gray-400 font-medium mt-1">μg/m³</div>
      </div>
    </div>
  );
};

// Quality Indicator Tabs
const QualityIndicatorTabs = ({ currentLevel }: { currentLevel: number }) => {
  const levels = [
    { label: 'ดี', color: '#52c41a', level: 1 },
    { label: 'ปานกลาง', color: '#faad14', level: 2 },
    { label: 'เริ่มมีผลกระทบ', color: '#fa8c16', level: 3 },
    { label: 'มีผลกระทบ', color: '#f5222d', level: 4 },
  ];

  return (
    <div className="flex gap-2 w-full">
      {levels.map((level) => (
        <div
          key={level.level}
          className="flex-1 text-center py-2.5 px-3 rounded-lg text-xs font-bold text-white transition-all"
          style={{
            backgroundColor: level.level === currentLevel ? level.color : `${level.color}80`,
            opacity: 1,
            transform: level.level === currentLevel ? 'scale(1.03)' : 'scale(1)',
            boxShadow: level.level === currentLevel ? `0 4px 12px ${level.color}60` : 'none',
          }}
        >
          {level.label}
        </div>
      ))}
    </div>
  );
};

// Metric Card with Progress Bar
const MetricCardWithBar = ({ label, value, unit, parameter }: {
  label: string;
  value: number;
  unit: string;
  parameter: ParameterType;
}) => {
  const color = getParameterColor(parameter, value);
  
  // Calculate progress percentage (0-100)
  const maxValues: Record<ParameterType, number> = {
    pm25: 250,
    pm10: 400,
    pm1: 150,
    co2: 2000,
    temperature: 50,
    humidity: 100,
    tvoc: 1000,
  };
  const progress = Math.min((value / (maxValues[parameter] || 100)) * 100, 100);

  return (
    <div
      style={{
        background: '#fafafa',
        borderRadius: '12px',
        padding: '18px',
        border: '1px solid #f0f0f0',
      }}
    >
      <div className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wide">{label}</div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-2xl font-bold" style={{ color }}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs text-gray-400 font-medium">{unit}</span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};


export const SensorInfoWindow = ({ sensor, onClose }: SensorInfoWindowProps) => {
  const pm25Color = getParameterColor('pm25', sensor.pm25);
  const pm25Level = getParameterLevel('pm25', sensor.pm25);

  return (
    <div
      className="relative rounded-2xl"
      style={{
        background: 'white',
        border: '1px solid rgba(0,0,0,0.08)',
        padding: '36px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-full transition-all z-10"
        style={{ background: 'transparent' }}
      >
        <CloseOutlined style={{ fontSize: 18, color: '#9ca3af' }} />
      </button>

      {/* Main Content: Circle + Temperature & Humidity */}
      <div className="flex items-center gap-8 mb-8">
        {/* Left: Circular Progress */}
        <div className="flex-shrink-0">
          <CircularProgress
            value={sensor.pm25}
            max={250}
            size={145}
            color={pm25Color}
          />
        </div>
        
        {/* Right: Temperature & Humidity */}
        <div className="flex-1">
          {/* Temperature */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(255,107,107,0.25)'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1h-1v1h1v2h-1v1h1v2h-2V5z"/>
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">อุณหภูมิ</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 ml-1">{sensor.temperature.toFixed(0)}°</div>
          </div>
          
          {/* Humidity */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(79,172,254,0.25)'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">ความชื้น</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 ml-1">{sensor.humidity.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="text-center mb-6 py-4" style={{ borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }}>
        <div className="flex items-center justify-center gap-2 text-gray-700">
          <EnvironmentOutlined style={{ fontSize: 14, color: '#667eea' }} />
          <span className="text-base font-bold">{sensor.name}</span>
        </div>
      </div>

      {/* Quality Indicator Tabs */}
      <div style={{ marginBottom: '28px' }}>
        <QualityIndicatorTabs currentLevel={Number(pm25Level)} />
      </div>

      {/* Metrics Grid (2x2) */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCardWithBar
          label="PM 10"
          value={sensor.pm10}
          unit="μg/m³"
          parameter="pm10"
        />
        <MetricCardWithBar
          label="CO2"
          value={sensor.co2}
          unit="ppm"
          parameter="co2"
        />
        <MetricCardWithBar
          label="PM1"
          value={sensor.pm1 || 0}
          unit="μg/m³"
          parameter="pm1"
        />
        <MetricCardWithBar
          label="TVOC"
          value={sensor.tvoc}
          unit="ppb"
          parameter="tvoc"
        />
      </div>
    </div>
  );
};
