'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Select, Typography, Space, Row, Col, Spin, Alert } from 'antd';
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
import { TimeRange, getTimeRangeLabel } from '../types/chartTypes';
import { fetchRealChartData, getLocationColor } from '../services/chartDataService';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartsData, setChartsData] = useState<any[]>([]);

  // Auto-select first 2 sensors on mount
  useEffect(() => {
    if (sensors.length > 0 && selectedSensorIds.length === 0) {
      const defaultSensors = sensors.slice(0, Math.min(2, sensors.length)).map((s) => s.id);
      setSelectedSensorIds(defaultSensors);
    }
  }, [sensors]);

  // Fetch real data for all selected sensors
  useEffect(() => {
    const fetchAllSensorsData = async () => {
      if (selectedSensorIds.length === 0) {
        setChartsData([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('📊 Fetching data for multiple sensors:', selectedSensorIds);

        const promises = selectedSensorIds.map(async (sensorId, index) => {
          const sensor = sensors.find((s) => s.id === sensorId);
          if (!sensor) return null;

          try {
            const data = await fetchRealChartData(sensor, parameter as any, timeRange);
            console.log(`✅ Fetched data for ${sensor.name}`);
            
            return {
              ...data,
              color: getLocationColor(index),
            };
          } catch (err) {
            console.error(`❌ Failed to fetch data for ${sensor.name}:`, err);
            return null;
          }
        });

        const results = await Promise.all(promises);
        const validResults = results.filter((r) => r !== null);
        
        setChartsData(validResults);
        
        if (validResults.length === 0) {
          setError('No data available for selected sensors');
        }
      } catch (err) {
        console.error('❌ Error fetching charts data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllSensorsData();
  }, [sensors, selectedSensorIds, parameter, timeRange]);

  // Generate colors for selected sensors
  const sensorColors = useMemo(() => {
    const colors: Record<string, string> = {};
    selectedSensorIds.forEach((id, index) => {
      colors[id] = getLocationColor(index);
    });
    return colors;
  }, [selectedSensorIds]);


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
      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Chart Data"
          description={error}
          type="warning"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#8c8c8c' }}>
              Loading chart data for {selectedSensorIds.length} sensor{selectedSensorIds.length > 1 ? 's' : ''}...
            </div>
          </div>
        ) : selectedSensorIds.length === 0 ? (
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
        {!loading && chartsData.length > 0 && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Comparing {chartsData.length} sensor{chartsData.length > 1 ? 's' : ''} - {getTimeRangeLabel(timeRange)}
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
};
