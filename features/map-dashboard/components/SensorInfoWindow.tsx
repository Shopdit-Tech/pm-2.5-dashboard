import { SensorData, ParameterType } from '@/types/sensor';
import { Card, Tag, Row, Col, Typography, Divider, Space } from 'antd';
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  ShopOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import {
  PARAMETER_LABELS,
  PARAMETER_UNITS,
} from '@/constants/airQualityRanges';
import { getParameterColor, getParameterLevel, getLevelLabel } from '@/utils/airQualityUtils';

const { Text, Title } = Typography;

type SensorInfoWindowProps = {
  sensor: SensorData;
  onClose?: () => void;
};

type ParameterCardProps = {
  label: string;
  value: number;
  unit: string;
  parameter: ParameterType;
  featured?: boolean;
};

const ParameterCard = ({ label, value, unit, parameter, featured = false }: ParameterCardProps) => {
  const color = getParameterColor(parameter, value);
  const level = getParameterLevel(parameter, value);
  const levelLabel = getLevelLabel(level);

  if (featured) {
    return (
      <div
        className="rounded-2xl p-6 shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${color}15 0%, ${color}30 100%)`,
          border: `2px solid ${color}`,
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <Text className="text-sm text-gray-600 font-medium">{label}</Text>
            <div className="mt-1">
              <Tag
                color={color}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ border: 'none' }}
              >
                {levelLabel}
              </Tag>
            </div>
          </div>
          <DashboardOutlined style={{ fontSize: 24, color: color, opacity: 0.6 }} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold" style={{ color }}>
            {value.toFixed(1)}
          </span>
          <span className="text-xl text-gray-500 font-medium">{unit}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-2">
        <Text className="text-xs text-gray-500 font-medium">{label}</Text>
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold" style={{ color }}>
          {value.toFixed(1)}
        </span>
        <span className="text-sm text-gray-400">{unit}</span>
      </div>
      <Tag
        color={color}
        className="px-2 py-0 rounded text-xs"
        style={{ border: 'none', fontSize: '10px' }}
      >
        {levelLabel}
      </Tag>
    </div>
  );
};

export const SensorInfoWindow = ({ sensor }: SensorInfoWindowProps) => {
  console.log('🎨 SensorInfoWindow rendering for:', sensor.name, sensor);
  
  const isOnline = sensor.status === 'online';
  const lastUpdate = new Date(sensor.timestamp).toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  console.log('📊 Sensor values:', {
    pm25: sensor.pm25,
    pm10: sensor.pm10,
    temp: sensor.temperature,
    humidity: sensor.humidity,
    co2: sensor.co2,
    tvoc: sensor.tvoc,
  });

  return (
    <div className="p-6" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              {sensor.type === 'indoor' ? (
                <HomeOutlined style={{ fontSize: 24 }} />
              ) : (
                <ShopOutlined style={{ fontSize: 24 }} />
              )}
            </div>
            <div>
              <Title level={3} className="mb-0 text-white">
                {sensor.name}
              </Title>
              <div className="flex items-center gap-2 mt-1">
                <EnvironmentOutlined className="text-sm" />
                <Text className="text-white text-opacity-90 text-sm">
                  {sensor.type === 'indoor' ? 'ภายในอาคาร' : 'ภายนอกอาคาร'}
                </Text>
              </div>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {isOnline ? '● ออนไลน์' : '● ออฟไลน์'}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-white text-opacity-80">
          <ClockCircleOutlined />
          <span>อัปเดตล่าสุด: {lastUpdate}</span>
        </div>
      </div>

      {isOnline ? (
        <>
          {/* Featured PM2.5 */}
          <div className="mb-6">
            <ParameterCard
              label={PARAMETER_LABELS.pm25}
              value={sensor.pm25}
              unit={PARAMETER_UNITS.pm25}
              parameter="pm25"
              featured
            />
          </div>

          <Divider className="my-6">
            <Text className="text-gray-400 text-sm">พารามิเตอร์อื่นๆ</Text>
          </Divider>

          {/* Other Parameters Grid */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12} md={8}>
              <ParameterCard
                label={PARAMETER_LABELS.pm10}
                value={sensor.pm10}
                unit={PARAMETER_UNITS.pm10}
                parameter="pm10"
              />
            </Col>
            <Col xs={12} sm={12} md={8}>
              <ParameterCard
                label={PARAMETER_LABELS.temperature}
                value={sensor.temperature}
                unit={PARAMETER_UNITS.temperature}
                parameter="temperature"
              />
            </Col>
            <Col xs={12} sm={12} md={8}>
              <ParameterCard
                label={PARAMETER_LABELS.humidity}
                value={sensor.humidity}
                unit={PARAMETER_UNITS.humidity}
                parameter="humidity"
              />
            </Col>
            <Col xs={12} sm={12} md={8}>
              <ParameterCard
                label={PARAMETER_LABELS.co2}
                value={sensor.co2}
                unit={PARAMETER_UNITS.co2}
                parameter="co2"
              />
            </Col>
            <Col xs={12} sm={12} md={8}>
              <ParameterCard
                label={PARAMETER_LABELS.tvoc}
                value={sensor.tvoc}
                unit={PARAMETER_UNITS.tvoc}
                parameter="tvoc"
              />
            </Col>
            {sensor.pm1 !== undefined && (
              <Col xs={12} sm={12} md={8}>
                <ParameterCard
                  label={PARAMETER_LABELS.pm1}
                  value={sensor.pm1}
                  unit={PARAMETER_UNITS.pm1}
                  parameter="pm1"
                />
              </Col>
            )}
          </Row>
        </>
      ) : (
        <Card className="text-center py-12 rounded-2xl">
          <div className="text-gray-400 text-lg">
            <DashboardOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>เซ็นเซอร์ไม่ได้เชื่อมต่อ</div>
            <Text type="secondary" className="text-sm">
              ไม่สามารถแสดงข้อมูลได้ในขณะนี้
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
};
