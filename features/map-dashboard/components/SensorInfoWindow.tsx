import { SensorData, ParameterType } from '@/types/sensor';
import { CloseOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { getParameterColor } from '@/utils/airQualityUtils';

type SensorInfoWindowProps = {
  sensor: SensorData;
  onClose?: () => void;
};

// Circular Progress Component with white background
const CircularProgress = ({ value, max, size = 145, strokeWidth = 16, color = '#00b050' }: {
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
  const isMobile = size < 120;

  return (
    <div 
      className="relative" 
      style={{ 
        width: size, 
        height: size,
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
    >
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
        <div style={{ 
          fontSize: isMobile ? '9px' : '10px',
          color: '#9ca3af',
          fontWeight: 600,
          marginBottom: isMobile ? 2 : 4,
          letterSpacing: '0.5px'
        }}>PM 2.5</div>
        <div style={{ 
          color: '#1f2937',
          lineHeight: '1',
          fontSize: isMobile ? '30px' : '38px',
          fontWeight: 700
        }}>
          {value.toFixed(1)}
        </div>
        <div style={{ 
          fontSize: isMobile ? '8px' : '10px',
          color: '#9ca3af',
          fontWeight: 500,
          marginTop: isMobile ? 2 : 3
        }}>μg/m³</div>
      </div>
    </div>
  );
};

// Horizontal Gradient Legend Bar
const AirQualityLegend = () => {
  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
      {/* Gradient Bar */}
      <div style={{
        height: '32px',
        borderRadius: '16px',
        background: 'linear-gradient(to right, #00b050 0%, #00b050 25%, #ffc107 25%, #ffc107 50%, #ff9800 50%, #ff9800 75%, #f44336 75%, #f44336 100%)',
        position: 'relative',
        overflow: 'visible',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
      }}>
        {/* Labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          transform: 'translateY(-50%)',
          padding: '0 8px'
        }}>
          <span style={{ 
            fontSize: '9px', 
            fontWeight: 700, 
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            flex: 1,
            textAlign: 'center'
          }}>ดี</span>
          <span style={{ 
            fontSize: '9px', 
            fontWeight: 700, 
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            flex: 1,
            textAlign: 'center'
          }}>ปานกลาง</span>
          <span style={{ 
            fontSize: '8px', 
            fontWeight: 700, 
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            flex: 1,
            textAlign: 'center',
            lineHeight: '1.1'
          }}>เริ่มมีผลกระทบต่อสุขภาพ</span>
          <span style={{ 
            fontSize: '8px', 
            fontWeight: 700, 
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            flex: 1,
            textAlign: 'center',
            lineHeight: '1.1'
          }}>มีผลกระทบต่อสุขภาพ</span>
        </div>
      </div>
    </div>
  );
};

// Simplified Metric Card with Progress Bar (matching image design)
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
    <div style={{ textAlign: 'center' }}>
      {/* Label */}
      <div style={{ 
        fontSize: '13px', 
        color: '#6b7280',
        fontWeight: 600,
        marginBottom: '8px',
        letterSpacing: '0.3px'
      }}>{label}</div>
      
      {/* Value + Unit */}
      <div style={{ marginBottom: '10px' }}>
        <span style={{ 
          fontSize: '24px',
          fontWeight: 700,
          color: '#1f2937',
          lineHeight: '1'
        }}>
          {value.toFixed(value >= 100 ? 0 : 1)}
        </span>
        <span style={{ 
          fontSize: '11px',
          color: '#9ca3af',
          marginLeft: '4px',
          fontWeight: 500
        }}>{unit}</span>
      </div>
      
      {/* Progress bar */}
      <div style={{
        width: '80%',
        height: '6px',
        background: '#e5e7eb',
        borderRadius: '3px',
        overflow: 'hidden',
        margin: '0 auto'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: color,
          borderRadius: '3px',
          transition: 'width 0.5s ease'
        }} />
      </div>
    </div>
  );
};


export const SensorInfoWindow = ({ sensor, onClose }: SensorInfoWindowProps) => {
  const pm25Color = getParameterColor('pm25', sensor.pm25);

  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(212, 241, 236, 0.95) 0%, rgba(230, 247, 245, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: typeof window !== 'undefined' && window.innerWidth < 768 ? '20px' : '28px',
        maxWidth: typeof window !== 'undefined' && window.innerWidth < 768 ? '95vw' : '580px',
        width: '100%',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          padding: '8px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        <CloseOutlined style={{ fontSize: 20, color: '#9ca3af' }} />
      </button>

      {/* Main Content: Circle + Temperature & Humidity */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        gap: '24px',
        marginBottom: '20px'
      }}>
        {/* Left: Circular Progress */}
        <div style={{ flexShrink: 0 }}>
          <CircularProgress
            value={sensor.pm25}
            max={250}
            size={typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 140}
            strokeWidth={typeof window !== 'undefined' && window.innerWidth < 768 ? 12 : 16}
            color={pm25Color}
          />
        </div>
        
        {/* Right: Temperature & Humidity */}
        <div style={{ flex: 1, paddingTop: '8px' }}>
          {/* Temperature */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '4px'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#6b7280">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v6m0 6v6m11-11h-6m-6 0H1"/>
              </svg>
              <span style={{ 
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: 600
              }}>อุณหภูมิ</span>
            </div>
            <div style={{ 
              fontSize: '26px',
              fontWeight: 700,
              color: '#1f2937',
              lineHeight: '1'
            }}>{sensor.temperature.toFixed(0)}°</div>
          </div>
          
          {/* Humidity */}
          <div>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '4px'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#6b7280">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
              <span style={{ 
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: 600
              }}>ความชื้นสัมพัทธ์</span>
            </div>
            <div style={{ 
              fontSize: '26px',
              fontWeight: 700,
              color: '#1f2937',
              lineHeight: '1'
            }}>{sensor.humidity.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <EnvironmentOutlined style={{ fontSize: 14, color: '#6b7280' }} />
          <span style={{ 
            fontSize: '15px',
            fontWeight: 600,
            color: '#4b5563'
          }}>{sensor.name}</span>
        </div>
      </div>

      {/* Air Quality Legend Bar */}
      <AirQualityLegend />

      {/* Metrics Grid (2x2) */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
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
