'use client';

import { useState, useMemo, useEffect } from 'react';
import { Modal, Typography, Card, Row, Col, Spin, Alert, Select } from 'antd';
import { LineChartOutlined, RiseOutlined, FallOutlined, DashboardOutlined } from '@ant-design/icons';
import { SensorData } from '@/types/sensor';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { useChartData } from '@/features/analytics-charts/hooks/useChartData';
import type { TimeRange } from '@/features/analytics-charts/types/chartTypes';
import { getTimeRangeLabel, getTimeRangeId } from '@/features/analytics-charts/types/chartTypes';
import { TIME_RANGES, getTimeRangeByIdOrDefault } from '@/features/analytics-charts/constants/timeRanges';
import { useThreshold } from '@/contexts/ThresholdContext';
import {
  getParameterLabel,
  getParameterUnit,
} from '../utils/parameterThresholds';
import type { QualityZone } from '../utils/parameterThresholds';

const { Text, Title } = Typography;

type ParameterHistoryModalProps = {
  sensor: SensorData;
  parameter: string;
  currentValue: number;
  visible: boolean;
  onClose: () => void;
};

export const ParameterHistoryModal = ({
  sensor,
  parameter,
  currentValue,
  visible,
  onClose,
}: ParameterHistoryModalProps) => {
  // Use threshold context for dynamic zones
  const { getThresholdsForMetric } = useThreshold();
  
  // Use the default time range config (24h with 15min intervals)
  const [timeRange, setTimeRange] = useState<TimeRange>(getTimeRangeByIdOrDefault('24h'));
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Normalize parameter name to SensorData key
  const normalizeParameter = (param: string): keyof Pick<SensorData, 'temperature' | 'humidity' | 'co2' | 'pm1' | 'pm25' | 'pm10' | 'tvoc'> => {
    const map: Record<string, any> = {
      'PM2.5': 'pm25',
      'PM₂.₅': 'pm25',
      'PM10': 'pm10',
      'PM₁₀': 'pm10',
      'PM1': 'pm1',
      'PM₁': 'pm1',
      'Temperature': 'temperature',
      'Humidity': 'humidity',
      'CO2': 'co2',
      'CO₂': 'co2',
      'TVOC': 'tvoc',
    };
    return (map[param] || param.toLowerCase()) as any;
  };

  const paramKey = normalizeParameter(parameter);
  
  // Fetch real historical data from API
  const { chartData, loading, error } = useChartData(sensor, paramKey, timeRange);

  // Calculate X-axis ticks manually for proper display
  const xAxisTicks = useMemo(() => {
    if (!chartData || chartData.data.length === 0) return [];
    
    // Show max 12 ticks
    const maxTicks = 12;
    const step = Math.max(1, Math.ceil(chartData.data.length / maxTicks));
    
    return chartData.data
      .filter((_, index) => index % step === 0)
      .map(d => d.timestamp);
  }, [chartData]);

  // Calculate statistics from real data
  const stats = useMemo(() => {
    if (!chartData) {
      return {
        current: currentValue,
        average: currentValue,
        min: currentValue,
        max: currentValue,
      };
    }
    return {
      current: currentValue,
      average: chartData.average,
      min: chartData.min,
      max: chartData.max,
    };
  }, [chartData, currentValue]);

  // Get quality zones from threshold configuration
  const zones = useMemo((): QualityZone[] => {
    const thresholds = getThresholdsForMetric(paramKey);
    
    if (thresholds.length === 0) {
      return [];
    }
    
    // Convert thresholds to quality zones
    return thresholds.map((threshold) => ({
      min: threshold.min_value,
      max: threshold.max_value,
      label: threshold.level.replace('_', ' ').charAt(0).toUpperCase() + threshold.level.slice(1).replace('_', ' '),
      color: threshold.color_hex,
      opacity: 0.15,
    }));
  }, [paramKey, getThresholdsForMetric]);

  // Format data for chart
  const formattedChartData = useMemo(() => {
    if (!chartData || !chartData.data) return [];
    return chartData.data.map((point) => ({
      timestamp: new Date(point.timestamp).getTime(),
      value: point.value,
      formattedTime: point.formattedTime,
      formattedDate: point.formattedDate,
    }));
  }, [chartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card
          size="small"
          style={{
            border: '1px solid #1890ff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          bodyStyle={{ padding: '8px 12px' }}
        >
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
            {data.formattedDate} {data.formattedTime}
          </Text>
          <Text style={{ fontSize: 14, color: '#1890ff' }}>
            <strong>{payload[0].value.toFixed(1)}</strong> {getParameterUnit(parameter)}
          </Text>
        </Card>
      );
    }
    return null;
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="95%"
      style={{ maxWidth: isMobile ? '100vw' : 1200, top: isMobile ? 0 : 20 }}
      centered={isMobile}
    >
      <div>
        {/* Header with gradient */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            padding: isMobile ? '20px 16px' : '32px',
            margin: '-24px -24px 24px -24px',
            borderRadius: '16px 16px 0 0',
          }}
        >
          <Title level={4} style={{ margin: 0, color: 'white', fontSize: isMobile ? 16 : 20 }}>
            <LineChartOutlined style={{ marginRight: 8 }} />
            {getParameterLabel(parameter)} ({getParameterUnit(parameter)})
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: isMobile ? 12 : 14, wordBreak: 'break-word' }}>
            {sensor.name} - {isMobile ? 'Historical Data' : 'Historical Data Analysis'}
          </Text>
        </div>

        <div style={{ padding: isMobile ? '0 16px 16px' : '0 24px 24px' }}>
          {/* Time Range Selector */}
          <div style={{ marginBottom: isMobile ? 16 : 24, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? 12 : 0 }}>
            {!isMobile && (
              <Text strong style={{ fontSize: 15 }}>
                ช่วงเวลา: {getTimeRangeLabel(timeRange)}
              </Text>
            )}
            <Select
              value={getTimeRangeId(timeRange)}
              onChange={(id) => setTimeRange(getTimeRangeByIdOrDefault(id))}
              style={{ width: isMobile ? '100%' : 250 }}
              size={isMobile ? 'middle' : 'large'}
            >
              {TIME_RANGES.map((range) => (
                <Select.Option key={range.id} value={range.id}>
                  {range.label}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Loading State */}
          {loading && (
            <Card style={{ borderRadius: 12, textAlign: 'center', padding: 60, marginBottom: 24 }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#8c8c8c' }}>
                กำลังโหลดข้อมูลเชิงประวัติศาสตร์...
              </div>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Alert
              message="ข้อผิดพลาดในการโหลดข้อมูล"
              description="ไม่สามารถโหลดข้อมูลเชิงประวัติศาสตร์ แสดงเฉพาะค่าปัจจุบันเท่านั้น"
              type="warning"
              showIcon
              style={{ marginBottom: 24, borderRadius: 12 }}
            />
          )}

          {/* Chart */}
          {!loading && formattedChartData.length > 0 && (
            <Card
              style={{
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                marginBottom: isMobile ? 16 : 24,
              }}
              bodyStyle={{ padding: isMobile ? '16px 8px' : '24px 16px' }}
            >
              <ResponsiveContainer width="100%" height={isMobile ? 280 : 400}>
              <LineChart data={formattedChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                {/* Background quality zones */}
                {zones.map((zone, index) => (
                  <ReferenceArea
                    key={index}
                    y1={zone.min}
                    y2={zone.max}
                    fill={zone.color}
                    fillOpacity={zone.opacity}
                  />
                ))}

                {/* Average line */}
                <ReferenceLine
                  y={stats.average}
                  stroke="#faad14"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: `Avg: ${stats.average.toFixed(1)}`,
                    position: 'right',
                    fill: '#faad14',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />

                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  ticks={xAxisTicks}
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp);
                    const hour = date.getHours();
                    const hour12 = hour % 12 || 12;
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    return `${hour12}${ampm}`;
                  }}
                  tick={{ fontSize: 12, fill: '#424242' }}
                  stroke="#BDBDBD"
                  tickLine={false}
                  height={80}
                  angle={-45}
                  textAnchor="end"
                />
                
                <YAxis
                  domain={[
                    (dataMin: number) => {
                      const min = Math.max(0, dataMin * 0.8); // 20% padding below, but not negative
                      return Math.floor(min);
                    },
                    (dataMax: number) => {
                      const max = dataMax * 1.2; // 20% padding above
                      return Math.ceil(max);
                    }
                  ]}
                  tick={{ fontSize: 11 }}
                  stroke="#8c8c8c"
                  label={{
                    value: `${getParameterLabel(parameter)} (${getParameterUnit(parameter)})`,
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 12, fill: '#595959' },
                  }}
                  scale="linear"
                  allowDataOverflow={false}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1890ff"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Zone Labels */}
            {zones.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                {zones.map((zone, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        backgroundColor: zone.color,
                        opacity: 0.6,
                        borderRadius: 3,
                      }}
                    />
                    <Text style={{ fontSize: 11, color: '#595959' }}>
                      {zone.label}
                    </Text>
                  </div>
                ))}
              </div>
            )}
            </Card>
          )}

          {/* Statistics Cards */}
          <Row gutter={isMobile ? [12, 12] : [16, 16]}>
            <Col xs={12} sm={6}>
              <Card
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  border: 'none',
                }}
                bodyStyle={{ padding: isMobile ? '16px 12px' : '20px', textAlign: 'center' }}
              >
                <DashboardOutlined style={{ fontSize: isMobile ? 20 : 24, color: 'white', marginBottom: isMobile ? 6 : 8 }} />
                <Text style={{ fontSize: isMobile ? 11 : 12, color: 'rgba(255,255,255,0.9)', display: 'block' }}>
                  ค่าปัจจุบัน
                </Text>
                <Text style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: 'white', display: 'block' }}>
                  {stats.current.toFixed(1)}
                </Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>
                  {getParameterUnit(parameter)}
                </Text>
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #faad14 0%, #fa8c16 100%)',
                  border: 'none',
                }}
                bodyStyle={{ padding: isMobile ? '16px 12px' : '20px', textAlign: 'center' }}
              >
                <LineChartOutlined style={{ fontSize: isMobile ? 20 : 24, color: 'white', marginBottom: isMobile ? 6 : 8 }} />
                <Text style={{ fontSize: isMobile ? 11 : 12, color: 'rgba(255,255,255,0.9)', display: 'block' }}>
                  ค่าเฉลี่ย
                </Text>
                <Text style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: 'white', display: 'block' }}>
                  {stats.average.toFixed(1)}
                </Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>
                  {getParameterUnit(parameter)}
                </Text>
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                  border: 'none',
                }}
                bodyStyle={{ padding: isMobile ? '16px 12px' : '20px', textAlign: 'center' }}
              >
                <FallOutlined style={{ fontSize: isMobile ? 20 : 24, color: 'white', marginBottom: isMobile ? 6 : 8 }} />
                <Text style={{ fontSize: isMobile ? 11 : 12, color: 'rgba(255,255,255,0.9)', display: 'block' }}>
                  ต่ำสุด
                </Text>
                <Text style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: 'white', display: 'block' }}>
                  {stats.min.toFixed(1)}
                </Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>
                  {getParameterUnit(parameter)}
                </Text>
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                  border: 'none',
                }}
                bodyStyle={{ padding: isMobile ? '16px 12px' : '20px', textAlign: 'center' }}
              >
                <RiseOutlined style={{ fontSize: isMobile ? 20 : 24, color: 'white', marginBottom: isMobile ? 6 : 8 }} />
                <Text style={{ fontSize: isMobile ? 11 : 12, color: 'rgba(255,255,255,0.9)', display: 'block' }}>
                  สูงสุด
                </Text>
                <Text style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: 'white', display: 'block' }}>
                  {stats.max.toFixed(1)}
                </Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>
                  {getParameterUnit(parameter)}
                </Text>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  );
};
