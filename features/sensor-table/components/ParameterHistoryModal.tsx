'use client';

import { useState, useMemo } from 'react';
import { Modal, Typography, Card, Row, Col, Button, Space } from 'antd';
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
import {
  generateHistoricalData,
  calculateStatistics,
  TimeRange,
  getTimeRangeLabel,
} from '../utils/historicalDataGenerator';
import {
  getZonesForParameter,
  getParameterLabel,
  getParameterUnit,
} from '../utils/parameterThresholds';

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
  const [timeRange, setTimeRange] = useState<TimeRange>('48h');

  // Generate historical data
  const historicalData = useMemo(() => {
    return generateHistoricalData(currentValue, parameter, timeRange);
  }, [currentValue, parameter, timeRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateStatistics(historicalData);
  }, [historicalData]);

  // Get quality zones for background
  const zones = useMemo(() => {
    return getZonesForParameter(parameter);
  }, [parameter]);

  // Format data for chart
  const chartData = useMemo(() => {
    return historicalData.map((point) => ({
      timestamp: new Date(point.timestamp).getTime(),
      value: point.value,
      formattedTime: new Date(point.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      formattedDate: new Date(point.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [historicalData]);

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

  // Get Y-axis domain
  const yAxisDomain = useMemo(() => {
    const maxZone = zones.length > 0 ? zones[zones.length - 1].max : stats.max * 1.2;
    return [0, Math.max(maxZone, stats.max * 1.1)];
  }, [zones, stats.max]);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: 1200, top: 20 }}
      centered={false}
    >
      <div>
        {/* Header with gradient */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            padding: '32px',
            margin: '-24px -24px 24px -24px',
            borderRadius: '16px 16px 0 0',
          }}
        >
          <Title level={4} style={{ margin: 0, color: 'white' }}>
            <LineChartOutlined style={{ marginRight: 8 }} />
            {getParameterLabel(parameter)} ({getParameterUnit(parameter)})
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
            {sensor.name} - Historical Data Analysis
          </Text>
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          {/* Time Range Selector */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: 15 }}>
              Time Range: {getTimeRangeLabel(timeRange)} (5 min intervals)
            </Text>
            <Space>
              {(['6h', '12h', '24h', '48h'] as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  type={timeRange === range ? 'primary' : 'default'}
                  onClick={() => setTimeRange(range)}
                  size="middle"
                >
                  {range.toUpperCase()}
                </Button>
              ))}
            </Space>
          </div>

          {/* Chart */}
          <Card
            style={{
              borderRadius: '12px',
              border: '1px solid #f0f0f0',
              marginBottom: 24,
            }}
            bodyStyle={{ padding: '24px 16px' }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                {/* Background quality zones */}
                {zones.map((zone, index) => (
                  <ReferenceArea
                    key={index}
                    y1={zone.min}
                    y2={zone.max}
                    fill={zone.color}
                    fillOpacity={zone.opacity}
                    ifOverflow="extendDomain"
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
                  tickFormatter={(timestamp) =>
                    new Date(timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })
                  }
                  tick={{ fontSize: 11 }}
                  stroke="#8c8c8c"
                />
                
                <YAxis
                  domain={yAxisDomain}
                  tick={{ fontSize: 11 }}
                  stroke="#8c8c8c"
                  label={{
                    value: `${getParameterLabel(parameter)} (${getParameterUnit(parameter)})`,
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 12, fill: '#595959' },
                  }}
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

          {/* Statistics Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  border: 'none',
                }}
                bodyStyle={{ padding: '20px', textAlign: 'center' }}
              >
                <DashboardOutlined style={{ fontSize: 24, color: 'white', marginBottom: 8 }} />
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', display: 'block' }}>
                  Current
                </Text>
                <Text style={{ fontSize: 24, fontWeight: 700, color: 'white', display: 'block' }}>
                  {stats.current.toFixed(1)}
                </Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
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
                bodyStyle={{ padding: '20px', textAlign: 'center' }}
              >
                <LineChartOutlined style={{ fontSize: 24, color: 'white', marginBottom: 8 }} />
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', display: 'block' }}>
                  Average
                </Text>
                <Text style={{ fontSize: 24, fontWeight: 700, color: 'white', display: 'block' }}>
                  {stats.average.toFixed(1)}
                </Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
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
                bodyStyle={{ padding: '20px', textAlign: 'center' }}
              >
                <FallOutlined style={{ fontSize: 24, color: 'white', marginBottom: 8 }} />
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', display: 'block' }}>
                  Minimum
                </Text>
                <Text style={{ fontSize: 24, fontWeight: 700, color: 'white', display: 'block' }}>
                  {stats.min.toFixed(1)}
                </Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
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
                bodyStyle={{ padding: '20px', textAlign: 'center' }}
              >
                <RiseOutlined style={{ fontSize: 24, color: 'white', marginBottom: 8 }} />
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', display: 'block' }}>
                  Maximum
                </Text>
                <Text style={{ fontSize: 24, fontWeight: 700, color: 'white', display: 'block' }}>
                  {stats.max.toFixed(1)}
                </Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
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
