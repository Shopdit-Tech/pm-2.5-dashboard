import { RoutePoint } from '@/types/route';
import {
  EnvironmentOutlined,
  CloseOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { getParameterColor, getParameterLevel } from '@/utils/airQualityUtils';
import type { ParameterType } from '@/types/sensor';

type RoutePointInfoWindowProps = {
  point: RoutePoint;
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
    <div className="flex flex-col gap-2 w-full">
      {levels.map((level) => (
        <div
          key={level.level}
          className="text-center py-2 px-3 rounded-lg text-xs font-bold text-white transition-all"
          style={{
            backgroundColor: level.level === currentLevel ? level.color : `${level.color}70`,
            opacity: level.level === currentLevel ? 1 : 0.8,
            transform: level.level === currentLevel ? 'scale(1.02)' : 'scale(1)',
            boxShadow: level.level === currentLevel ? `0 3px 10px ${level.color}50` : 'none',
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
        borderRadius: '10px',
        padding: '14px',
        border: '1px solid #f0f0f0',
      }}
    >
      <div className="text-gray-400 text-xs font-bold mb-1.5 uppercase tracking-wide">{label}</div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-xl font-bold" style={{ color }}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs text-gray-400 font-medium">{unit}</span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
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

export const RoutePointInfoWindow = ({ point, onClose }: RoutePointInfoWindowProps) => {
  const pm25Color = getParameterColor('pm25', point.pm25);
  const pm25Level = getParameterLevel('pm25', point.pm25);

  // Format timestamp in UTC+7 (Asia/Bangkok timezone)
  const timestamp = new Date(point.timestamp);
  const timeString = timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok', // Force UTC+7 display
  });
  const dateString = timestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Bangkok', // Force UTC+7 display
  });

  return (
    <div
      className="relative rounded-2xl"
      style={{
        background: 'white',
        border: '1px solid rgba(0,0,0,0.08)',
        padding: '32px',
        maxWidth: '920px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-all z-10"
        style={{ background: 'transparent' }}
      >
        <CloseOutlined style={{ fontSize: 18, color: '#9ca3af' }} />
      </button>

      {/* Top Section: Circle, Temp/Humidity, and Info */}
      <div className="flex items-start gap-6 mb-6">
        {/* Left: Circular Progress */}
        <div className="flex-shrink-0">
          <CircularProgress
            value={point.pm25}
            max={250}
            size={130}
            strokeWidth={16}
            color={pm25Color}
          />
        </div>
        
        {/* Middle: Temperature & Humidity */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4">
            {/* Temperature */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div style={{ 
                  width: '26px', 
                  height: '26px', 
                  borderRadius: '7px', 
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(255,107,107,0.25)'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1h-1v1h1v2h-1v1h1v2h-2V5z"/>
                  </svg>
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">อุณหภูมิ</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{point.temperature.toFixed(0)}°C</div>
            </div>
            
            {/* Humidity */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div style={{ 
                  width: '26px', 
                  height: '26px', 
                  borderRadius: '7px', 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(79,172,254,0.25)'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">ความชื้น</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{point.humidity.toFixed(0)}%</div>
            </div>
          </div>
          
          {/* Timestamp & Speed */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-700">
              <ClockCircleOutlined style={{ fontSize: 13, color: '#667eea' }} />
              <span className="text-sm font-bold">{timeString}</span>
              <span className="text-xs text-gray-400">{dateString}</span>
            </div>
            {point.speed && (
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-semibold">Speed:</span> {point.speed.toFixed(1)} km/h
              </div>
            )}
          </div>
        </div>

        {/* Right: Quality Indicator */}
        <div className="flex-1">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">คุณภาพอากาศ</div>
          <QualityIndicatorTabs currentLevel={Number(pm25Level)} />
        </div>
      </div>

      {/* Metrics Grid - 3 columns */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MetricCardWithBar
          label="PM 1.0"
          value={point.pm1}
          unit="μg/m³"
          parameter="pm1"
        />
        <MetricCardWithBar
          label="PM 10"
          value={point.pm10}
          unit="μg/m³"
          parameter="pm10"
        />
        <MetricCardWithBar
          label="CO₂"
          value={point.co2}
          unit="ppm"
          parameter="co2"
        />
        <MetricCardWithBar
          label="TVOC"
          value={point.tvoc}
          unit="ppb"
          parameter="tvoc"
        />
        {point.particle_0p3 !== undefined && (
          <MetricCardWithBar
            label="Particles 0.3μm"
            value={point.particle_0p3}
            unit="#"
            parameter="pm1"
          />
        )}
        {point.tvoc_index !== undefined && (
          <MetricCardWithBar
            label="TVOC Index"
            value={point.tvoc_index}
            unit=""
            parameter="tvoc"
          />
        )}
        {point.nox_index !== undefined && (
          <MetricCardWithBar
            label="NOx Index"
            value={point.nox_index}
            unit=""
            parameter="pm10"
          />
        )}
        {point.tvoc_raw_logr !== undefined && (
          <MetricCardWithBar
            label="TVOC Raw"
            value={point.tvoc_raw_logr}
            unit="logr"
            parameter="tvoc"
          />
        )}
        {point.nox_raw_logr !== undefined && (
          <MetricCardWithBar
            label="NOx Raw"
            value={point.nox_raw_logr}
            unit="logr"
            parameter="pm10"
          />
        )}
      </div>

      {/* Location coordinates */}
      <div
        className="text-center py-2 px-4 rounded-lg"
        style={{
          background: '#fafafa',
          border: '1px solid #f0f0f0',
        }}
      >
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <EnvironmentOutlined style={{ fontSize: 11 }} />
          <span className="text-xs font-mono">
            {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
          </span>
        </div>
      </div>
    </div>
  );
};
