'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Select, Typography, Space } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { SensorData } from '@/types/sensor';
import { TimeRange, getTimeRangeLabel } from '../types/chartTypes';
import { generateChartData, aggregateDataPoints } from '../services/chartDataService';
import { getParameterLabel, getParameterUnit } from '@/features/sensor-table/utils/parameterThresholds';
import { getParameterColor } from '@/utils/airQualityUtils';

const { Text } = Typography;
const { Option } = Select;

type BarChartPanelProps = {
  sensors: SensorData[];
  defaultParameter?: string;
  defaultSensorId?: string;
  defaultTimeRange?: TimeRange;
};

export const BarChartPanel = ({
  sensors,
  defaultParameter = 'pm25',
  defaultSensorId,
  defaultTimeRange = '7d',
}: BarChartPanelProps) => {
  const [parameter, setParameter] = useState(defaultParameter);
  const [sensorId, setSensorId] = useState(defaultSensorId || sensors[0]?.id);
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate chart data
  const chartData = useMemo(() => {
    const sensor = sensors.find((s) => s.id === sensorId);
    if (!sensor) return null;

    const data = generateChartData(sensor, parameter as any, timeRange);
    
    // Aggregate to ~24 bars for readability
    const aggregated = aggregateDataPoints(data.data, 24);
    
    return {
      ...data,
      data: aggregated.map((point) => ({
        ...point,
        // Color based on value
        fill: getParameterColor(parameter as any, point.value),
      })),
    };
  }, [sensors, sensorId, parameter, timeRange, lastUpdate]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card size="small" style={{ border: '1px solid #d9d9d9' }} styles={{ body: { padding: '8px 12px' } }}>
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            {data.formattedDate} {data.formattedTime}
          </Text>
          <Text style={{ fontSize: 13 }}>
            {payload[0].value.toFixed(1)} {getParameterUnit(parameter)}
          </Text>
        </Card>
      );
    }
    return null;
  };

  if (!chartData) return null;

  return (
    <Card
      style={{
        borderRadius: '12px',
        border: '1px solid #f0f0f0',
        height: '100%',
      }}
      styles={{ body: { padding: '16px' } }}
    >
      {/* Controls */}
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size="small">
        <Space wrap>
          <Select
            value={parameter}
            onChange={setParameter}
            style={{ width: 150 }}
            size="middle"
          >
            <Option value="pm1">PM₁</Option>
            <Option value="pm25">PM₂.₅</Option>
            <Option value="pm10">PM₁₀</Option>
            <Option value="co2">CO₂</Option>
            <Option value="temperature">Temperature</Option>
            <Option value="humidity">Humidity</Option>
            <Option value="tvoc">TVOC</Option>
          </Select>

          <Select
            value={sensorId}
            onChange={setSensorId}
            style={{ width: 200 }}
            size="middle"
            showSearch
            optionFilterProp="children"
          >
            {sensors.map((sensor) => (
              <Option key={sensor.id} value={sensor.id}>
                {sensor.name}
              </Option>
            ))}
          </Select>

          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 150 }}
            size="middle"
          >
            <Option value="1h">Last 1 Hour</Option>
            <Option value="8h">Last 8 Hours</Option>
            <Option value="24h">Last 24 Hours</Option>
            <Option value="48h">Last 48 Hours</Option>
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
          </Select>
        </Space>
      </Space>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          
          <XAxis
            dataKey="formattedTime"
            tick={{ fontSize: 11 }}
            stroke="#8c8c8c"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#8c8c8c"
            label={{
              value: `${getParameterLabel(parameter)} (${getParameterUnit(parameter)})`,
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 11, fill: '#595959' },
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Average line */}
          <ReferenceLine
            y={chartData.average}
            stroke="#faad14"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `${getTimeRangeLabel(timeRange)} Average: ${chartData.average.toFixed(1)}`,
              position: 'top',
              fill: '#faad14',
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          
          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Footer */}
      <div style={{ marginTop: 8, textAlign: 'right' }}>
        <Text type="secondary" style={{ fontSize: 11 }}>
          Last update: {lastUpdate.toLocaleTimeString('en-US')}
        </Text>
      </div>
    </Card>
  );
};
