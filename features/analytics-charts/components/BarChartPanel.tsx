'use client';

import { useState, useMemo } from 'react';
import { Card, Select, Typography, Space, Spin, Alert } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { SensorData } from '@/types/sensor';
import { TimeRange, getTimeRangeId } from '../types/chartTypes';
import { TIME_RANGES, getTimeRangeByIdOrDefault } from '../constants/timeRanges';
import { useChartData } from '../hooks/useChartData';
import { getParameterUnit } from '@/features/sensor-table/utils/parameterThresholds';
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
  
  // Handle both legacy string and new TimeRangeConfig
  const initialTimeRangeId = typeof defaultTimeRange === 'string' 
    ? defaultTimeRange 
    : getTimeRangeId(defaultTimeRange);
  const [timeRange, setTimeRange] = useState<TimeRange>(getTimeRangeByIdOrDefault(initialTimeRangeId));

  // Get current sensor
  const currentSensor = useMemo(
    () => sensors.find((s) => s.id === sensorId),
    [sensors, sensorId]
  );

  // Fetch real chart data from API
  const { chartData: apiChartData, loading, error } = useChartData(
    currentSensor,
    parameter as any,
    timeRange
  );

  // Process chart data for bar chart
  const chartData = useMemo(() => {
    if (!apiChartData) return null;
    
    // Show all data points without aggressive aggregation
    // This ensures we display all hourly data from the API
    const data = apiChartData.data;
    
    // Calculate 24-hour average (for all parameters) - excluding null/0 values
    let avg24h = null;
    if (data.length > 0) {
      const last24 = data.slice(-Math.min(24, data.length));
      const validValues = last24.filter((p) => p.value && p.value > 0).map((p) => p.value);
      if (validValues.length > 0) {
        const sum = validValues.reduce((acc: any, val: any) => acc + val, 0);
        avg24h = sum / validValues.length;
      }
    }
    
    return {
      ...apiChartData,
      data,
      avg24h,
    };
  }, [apiChartData, parameter]);

  // Calculate intelligent X-axis tick interval based on data length
  const xAxisInterval = useMemo(() => {
    if (!chartData) return 0;
    const len = chartData.data.length;
    if (len <= 12) return 0;      // Show all (< 12 hours)
    if (len <= 24) return 1;      // Every 2nd (12-24 hours)
    if (len <= 48) return 3;      // Every 4th (1-2 days)
    if (len <= 96) return 7;      // Every 8th (2-4 days)
    if (len <= 168) return 11;    // Every 12th (4-7 days)
    return Math.floor(len / 12);  // Show max ~12 ticks for very long ranges
  }, [chartData]);

  // Get bar color based on value and parameter using threshold config
  const getBarColor = (value: number) => {
    return getParameterColor(parameter as any, value ?? 0);
  };

  // Format hour for x-axis (e.g., "3AM", "4PM")
  const formatHourLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const hour = date.getHours();
    const hour12 = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour12}${ampm}`;
  };

  // Get current timestamp for "Last update"
  const lastUpdate = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear().toString().slice(-2);
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `Last update: ${day} ${month} ${year}, ${time}`;
  }, [chartData]);

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

  // Custom label component for average line with gold background
  const GoldAverageLabel = (props: any) => {
    const { viewBox, value } = props;
    if (!viewBox || !value) return null;
    
    const chartWidth = viewBox.width;
    const centerX = chartWidth / 2;
    const text = `24h Avg: ${value.toFixed(1)} ${getParameterUnit(parameter)}`;
    
    return (
      <g>
        <rect
          x={centerX - 42}
          y={viewBox.y - 19}
          width={180}
          height={28}
          fill="#1d63dc"
          fillOpacity="0.75"
          rx={14}
          stroke="#1d63dc"
          strokeWidth={2}
        />
        <text
          x={centerX + 50}
          y={viewBox.y - 1}
          textAnchor="middle"
          fill="white"
          fontSize={10}
          fontWeight={700}
        >
          {text}
        </text>
      </g>
    );
  };


  return (
    <Card
      style={{
        borderRadius: '12px',
        border: '1px solid #f0f0f0',
        height: '100%',
      }}
      styles={{ body: { padding: '16px' } }}
    >
      {/* Error State */}
      {error && (
        <Alert
          message="Error Loading Chart Data"
          description="Unable to load historical data. Please try selecting a different sensor or time range."
          type="warning"
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      {/* Controls */}
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size="small">
        <Space wrap>
          <Select
            value={parameter}
            onChange={setParameter}
            style={{ width: 150 }}
            size="middle"
            className="font-noto-sans-thai"
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
            className="font-noto-sans-thai"
          >
            {sensors.map((sensor) => (
              <Option key={sensor.id} value={sensor.id}>
                {sensor.name}
              </Option>
            ))}
          </Select>

          <Select
            value={getTimeRangeId(timeRange)}
            onChange={(id) => setTimeRange(getTimeRangeByIdOrDefault(id))}
            style={{ width: 250 }}
            size="middle"
            className="font-noto-sans-thai"
          >
            {TIME_RANGES.map((range) => (
              <Option key={range.id} value={range.id}>
                {range.label}
              </Option>
            ))}
          </Select>
        </Space>
      </Space>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#8c8c8c' }}>
            Loading chart data...
          </div>
        </div>
      )}

      {/* Chart - Wrapped with key to force remount on sensor change */}
      {!loading && chartData && (
        <div key={`chart-${sensorId}-${parameter}`}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={chartData.data} 
              margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
              barGap={0}
              barCategoryGap="0%"
            >
              <CartesianGrid 
                strokeDasharray="0" 
                stroke="#E0E0E0" 
                vertical={false}
              />
              
              {/* X-Axis: Time labels with intelligent interval and rotation */}
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatHourLabel}
                tick={{ fontSize: 12, fill: '#424242' }}
                stroke="#BDBDBD"
                tickLine={false}
                height={80}
                interval={xAxisInterval}
                angle={-45}
                textAnchor="end"
              />
              
              {/* Y-Axis: Auto-scaled with domain to ensure reference lines are visible for PM2.5 */}
              <YAxis
                tick={{ fontSize: 13, fill: '#424242' }}
                stroke="#BDBDBD"
                tickLine={false}
                axisLine={false}
                domain={parameter === 'pm25' ? [0, (dataMax: number) => Math.max(dataMax, 50)] : [0, 'auto']}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Bars with dynamic colors using threshold config - stroke covers gaps */}
              <Bar 
                dataKey="value"
                isAnimationActive={false}
                maxBarSize={40}
              >
                {chartData.data.map((entry: any, index: number) => {
                  const barColor = getBarColor(entry.value ?? 0);
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={barColor}
                      stroke={barColor}
                      strokeWidth={2}
                    />
                  );
                })}
              </Bar>
              
              {/* PM2.5 Reference Lines - Good (25) and Warning (37.5) thresholds - Render on top */}
              {parameter === 'pm25' && (
                <>
                  <ReferenceLine
                    y={25}
                    stroke="#48BB78"
                    strokeWidth={3}
                    isFront={true}
                    label={{
                      value: 'Good (25)',
                      position: 'insideTopRight',
                      fill: '#48BB78',
                      fontSize: 8,
                      fontWeight: 700,
                      offset: 10,
                    }}
                  />
                  <ReferenceLine
                    y={37.5}
                    stroke="#FFA500"
                    strokeWidth={3}
                    isFront={true}
                    label={{
                      value: 'Moderate (37.5)',
                      position: 'insideTopRight',
                      fill: '#FFA500',
                      fontSize: 8,
                      fontWeight: 700,
                      offset: 10,
                    }}
                  />
                </>
              )}
              
              {/* 24-Hour Average Line - AFTER bars for top layer rendering */}
              {chartData.avg24h && (
                <ReferenceLine
                  y={chartData.avg24h}
                  stroke="#1d63dc"
                  strokeWidth={3}
                  label={<GoldAverageLabel value={chartData.avg24h} />}
                  isFront={true}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
          
          {/* Last update timestamp */}
          <div style={{ marginTop: 12, marginLeft: 10 }}>
            <Text style={{ fontSize: 13, color: '#757575' }}>
              {lastUpdate}
            </Text>
          </div>
        </div>
      )}

    </Card>
  );
};
