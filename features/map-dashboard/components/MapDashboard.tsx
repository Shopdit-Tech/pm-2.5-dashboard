import { useState } from 'react';
import { Layout, Card, Alert, Button, Space, Tag, Statistic, Row, Col } from 'antd';
import { ReloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { GoogleMapComponent } from './GoogleMapComponent';
import { useSensorData } from '../hooks/useSensorData';
import { getParameterLevel, getLevelLabel } from '@/utils/airQualityUtils';

const { Content } = Layout;

export const MapDashboard = () => {
  const { sensors, error, refetch } = useSensorData(60000); // Auto-refresh every 60 seconds
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Calculate statistics
  const onlineSensors = sensors.filter((s) => s.status === 'online');
  const offlineSensors = sensors.filter((s) => s.status === 'offline');
  const indoorSensors = sensors.filter((s) => s.type === 'indoor' && s.status === 'online');
  const outdoorSensors = sensors.filter((s) => s.type === 'outdoor' && s.status === 'online');

  const avgPM25Indoor =
    indoorSensors.length > 0
      ? indoorSensors.reduce((sum, s) => sum + s.pm25, 0) / indoorSensors.length
      : 0;

  const avgPM25Outdoor =
    outdoorSensors.length > 0
      ? outdoorSensors.reduce((sum, s) => sum + s.pm25, 0) / outdoorSensors.length
      : 0;

  return (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100%' }}>
      {/* Header */}
      <div className="mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: '#262626' }}>
            Static Sensor Monitoring
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#8c8c8c', fontSize: 14 }}>
            Real-time PM2.5 and air quality parameters
          </p>
        </div>
        <Button
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={handleRefresh}
          loading={refreshing}
          size="large"
          style={{
            borderRadius: 8,
            height: 40,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderColor: 'transparent',
            color: 'white',
            fontWeight: 500,
          }}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            }}
          >
            <Statistic
              title="Total Sensors"
              value={sensors.length}
              suffix="points"
              valueStyle={{ color: '#667eea', fontSize: 28, fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #52c41a15 0%, #73d13d15 100%)',
            }}
          >
            <Statistic
              title="Online"
              value={onlineSensors.length}
              suffix={`/ ${sensors.length}`}
              valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ marginBottom: 4 }}>
              <Tag color="blue" style={{ borderRadius: 4 }}>Indoor</Tag>
            </div>
            <Statistic
              title="Avg PM2.5"
              value={avgPM25Indoor.toFixed(1)}
              suffix="µg/m³"
              valueStyle={{ color: '#1890ff', fontSize: 24, fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ marginBottom: 4 }}>
              <Tag color="green" style={{ borderRadius: 4 }}>Outdoor</Tag>
            </div>
            <Statistic
              title="Avg PM2.5"
              value={avgPM25Outdoor.toFixed(1)}
              suffix="µg/m³"
              valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {error && (
        <Alert
          message="Error Loading Data"
          description="Unable to load sensor data. Please try again."
          type="error"
          closable
          className="mb-4"
          style={{ borderRadius: 8 }}
        />
      )}

      {offlineSensors.length > 0 && (
        <Alert
          message={`${offlineSensors.length} Sensors Offline`}
          description={offlineSensors.map((s) => s.name).join(', ')}
          type="warning"
          closable
          className="mb-4"
          style={{ borderRadius: 8 }}
        />
      )}

      {/* Map Container */}
      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ height: 'calc(100vh - 380px)', minHeight: '600px' }}>
          <GoogleMapComponent sensors={sensors} />
        </div>
      </Card>

      {/* Legend */}
      <div style={{ marginTop: 16, textAlign: 'center', color: '#8c8c8c', fontSize: 13 }}>
        <Space size="large">
          <span>🟢 Good (0-12)</span>
          <span>🟡 Moderate (12-35)</span>
          <span>🟠 Unhealthy (35-55)</span>
          <span>🔴 Hazardous (&gt;55)</span>
        </Space>
      </div>
    </div>
  );
};
