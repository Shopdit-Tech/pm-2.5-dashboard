'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Select, Typography, Space, Row, Col } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SensorData } from '@/types/sensor';
import { TimeRange } from '../types/chartTypes';
import { generateChartData, getLocationColor } from '../services/chartDataService';
import { getParameterLabel, getParameterUnit } from '@/features/sensor-table/utils/parameterThresholds';
import { ParameterTabs } from './ParameterTabs';
import { LocationSelector } from './LocationSelector';

const { Title, Text } = Typography;
const { Option } = Select;

type MultiLocationLineChartProps = {
  sensors: SensorData[];
};

export const MultiLocationLineChart = ({ sensors }: MultiLocationLineChartProps) => {
  const [parameter, setParameter] = useState('pm25');
  const [timeRange, setTimeRange] = useState<TimeRange>('48h');
  const [selectedSensorIds, setSelectedSensorIds] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-select first 2 sensors on mount
  useEffect(() => {
    if (sensors.length > 0 && selectedSensorIds.length === 0) {
      const defaultSensors = sensors.slice(0, Math.min(2, sensors.length)).map((s) => s.id);
      setSelectedSensorIds(defaultSensors);
    }
  }, [sensors]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate colors for selected sensors
  const sensorColors = useMemo(() => {
    const colors: Record<string, string> = {};
    selectedSensorIds.forEach((id, index) => {
      colors[id] = getLocationColor(index);
    });
    return colors;
  }, [selectedSensorIds]);

  // Generate chart data for all selected sensors
  const chartsData = useMemo(() => {
    const results = selectedSensorIds
      .map((sensorId) => {
        const sensor = sensors.find((s) => s.id === sensorId);
        if (!sensor) return null;

        const data = generateChartData(sensor, parameter as any, timeRange);
        
        console.log(`📈 Generated data for ${sensor.name}:`, {
          sensorId,
          parameter,
          dataPoints: data.data.length,
          average: data.average,
          sampleValue: data.data[0]?.value,
        });
        
        return {
          ...data,
          color: sensorColors[sensorId],
        };
      })
      .filter((d) => d !== null);
    
    console.log('📊 Total charts data:', results.length);
    return results;
  }, [sensors, selectedSensorIds, parameter, timeRange, sensorColors, lastUpdate]);

  // Merge data from all sensors into single dataset for Recharts
  const mergedChartData = useMemo(() => {
    if (chartsData.length === 0) return [];

    // Get the maximum length to ensure we have all data points
    const maxLength = Math.max(...chartsData.map(chart => chart.data.length));
    const result: any[] = [];

    // Create data points for each time index
    for (let i = 0; i < maxLength; i++) {
      // Use the first sensor's timestamp as reference (they should all be the same)
      const basePoint = chartsData[0].data[i];
      if (!basePoint) continue;

      const timestampNum = new Date(basePoint.timestamp).getTime();
      
      // Skip invalid timestamps
      if (isNaN(timestampNum)) {
        continue;
      }

      const dataPoint: any = { timestamp: timestampNum };

      // Add data from each sensor at this index
      chartsData.forEach((chart) => {
        const point = chart.data[i]; // Use same index instead of searching
        const value = point?.value;
        
        // Add value for this sensor
        if (typeof value === 'number' && !isNaN(value) && value > 0) {
          dataPoint[chart.sensorId] = value;
        } else {
          dataPoint[chart.sensorId] = null;
        }
      });

      // Add formatted time for display
      const date = new Date(basePoint.timestamp);
      dataPoint.formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      dataPoint.formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      result.push(dataPoint);
    }

    console.log('📊 Merged chart data:', {
      numPoints: result.length,
      sensors: chartsData.map(c => c.sensorName),
      samplePoint: result[0],
    });

    return result;
  }, [chartsData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const dataPoint = payload[0].payload;

      return (
        <Card
          size="small"
          style={{
            border: '1px solid #1890ff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          styles={{ body: { padding: '12px' } }}
        >
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            {dataPoint.formattedDate} {dataPoint.formattedTime}
          </Text>
          
          {chartsData.map((chart) => {
            const value = dataPoint[chart.sensorId];
            if (value === null || value === undefined) return null;

            return (
              <div key={chart.sensorId} style={{ marginBottom: 4 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    backgroundColor: chart.color,
                    borderRadius: '50%',
                    marginRight: 6,
                  }}
                />
                <Text style={{ fontSize: 12 }}>
                  {chart.sensorName}: <strong>{value.toFixed(1)}</strong> {getParameterUnit(parameter)}
                </Text>
              </div>
            );
          })}
        </Card>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Historical Trends - Multi-Location Comparison
        </Title>
        <Text type="secondary">
          Compare air quality parameters across multiple locations over time
        </Text>
      </div>

      {/* Controls */}
      <Card style={{ marginBottom: 16, borderRadius: '12px' }} styles={{ body: { padding: '20px' } }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Parameter Tabs */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 12 }}>
              Select Parameter:
            </Text>
            <ParameterTabs activeParameter={parameter} onChange={setParameter} />
          </div>

          {/* Time Range & Location Selection */}
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Time Range:
              </Text>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: '100%' }}
                size="large"
              >
                <Option value="1h">Last 1 Hour</Option>
                <Option value="8h">Last 8 Hours</Option>
                <Option value="24h">Last 24 Hours</Option>
                <Option value="48h">Last 48 Hours</Option>
                <Option value="7d">Last 7 Days</Option>
                <Option value="30d">Last 30 Days</Option>
              </Select>
            </Col>

            <Col xs={24} md={16}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Locations:
              </Text>
              <LocationSelector
                sensors={sensors}
                selectedIds={selectedSensorIds}
                onChange={setSelectedSensorIds}
                colors={sensorColors}
              />
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Chart */}
      <Card style={{ borderRadius: '12px' }} styles={{ body: { padding: '20px' } }}>
        {selectedSensorIds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Text type="secondary" style={{ fontSize: 15 }}>
              Select one or more locations to view comparison chart
            </Text>
          </div>
        ) : mergedChartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Text type="secondary" style={{ fontSize: 15 }}>
              No valid data available for selected sensors
            </Text>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={mergedChartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

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
                domain={[0, 'auto']}
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
              
              <Legend
                verticalAlign="bottom"
                iconType="line"
                wrapperStyle={{ fontSize: 12 }}
              />

              {/* Draw lines for each sensor */}
              {chartsData.map((chart) => (
                <Line
                  key={chart.sensorId}
                  type="monotone"
                  dataKey={chart.sensorId}
                  name={chart.sensorName}
                  stroke={chart.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  connectNulls={true}
                />
              ))}

              {/* Draw average lines for each sensor */}
              {chartsData.map((chart) => (
                <ReferenceLine
                  key={`${chart.sensorId}_avg`}
                  y={chart.average}
                  stroke={chart.color}
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  label={{
                    value: `${chart.sensorName} Avg: ${chart.average.toFixed(1)}`,
                    position: 'right',
                    fill: chart.color,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Footer */}
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Last update: {lastUpdate.toLocaleTimeString('en-US')}
          </Text>
        </div>
      </Card>
    </div>
  );
};
