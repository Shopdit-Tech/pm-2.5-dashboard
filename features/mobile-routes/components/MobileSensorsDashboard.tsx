import { useState } from 'react';
import { Card, Alert, Button, Space, Tag, Statistic, Row, Col } from 'antd';
import { ReloadOutlined, CarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { GoogleMapComponent } from '@/features/map-dashboard/components/GoogleMapComponent';
import { useMobileSensors } from '../hooks/useMobileSensors';

export const MobileSensorsDashboard = () => {
  const { sensors, error, refetch, loading } = useMobileSensors(30000); // Auto-refresh every 30 seconds
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Calculate statistics
  const onlineSensors = sensors.filter((s) => s.status === 'online');
  const offlineSensors = sensors.filter((s) => s.status === 'offline');

  const avgPM25 =
    onlineSensors.length > 0
      ? onlineSensors.reduce((sum, s) => sum + s.pm25, 0) / onlineSensors.length
      : 0;

  const maxPM25 =
    onlineSensors.length > 0
      ? Math.max(...onlineSensors.map((s) => s.pm25))
      : 0;

  return (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100%' }}>
      {/* Header */}
      <div className="mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: '#262626' }}>
            <CarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Mobile Sensor Monitoring
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#8c8c8c', fontSize: 14 }}>
            Real-time tracking of mobile air quality sensors
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
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
              background: 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)',
            }}
          >
            <Statistic
              title="Total Mobile Sensors"
              value={sensors.length}
              suffix="devices"
              valueStyle={{ color: '#f5576c', fontSize: 28, fontWeight: 'bold' }}
              prefix={<CarOutlined />}
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
              title="Active Now"
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
              <Tag color="blue" style={{ borderRadius: 4 }}>Average</Tag>
            </div>
            <Statistic
              title="PM2.5"
              value={avgPM25.toFixed(1)}
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
              <Tag color="red" style={{ borderRadius: 4 }}>Maximum</Tag>
            </div>
            <Statistic
              title="PM2.5"
              value={maxPM25.toFixed(1)}
              suffix="µg/m³"
              valueStyle={{ color: '#ff4d4f', fontSize: 24, fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {error && (
        <Alert
          message="Error Loading Data"
          description="Unable to load mobile sensor data. Please try again."
          type="error"
          closable
          className="mb-4"
          style={{ borderRadius: 8 }}
        />
      )}

      {loading && sensors.length === 0 && (
        <Alert
          message="Loading Mobile Sensors"
          description="Fetching real-time mobile sensor data..."
          type="info"
          className="mb-4"
          style={{ borderRadius: 8 }}
        />
      )}

      {!loading && sensors.length === 0 && !error && (
        <Alert
          message="No Mobile Sensors Available"
          description="There are no mobile sensors currently active."
          type="warning"
          className="mb-4"
          style={{ borderRadius: 8 }}
        />
      )}

      {offlineSensors.length > 0 && (
        <Alert
          message={`${offlineSensors.length} Mobile Sensors Offline`}
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
          <span><CarOutlined /> Mobile Sensors</span>
          <span>🟢 Good (0-12)</span>
          <span>🟡 Moderate (12-35)</span>
          <span>🟠 Unhealthy (35-55)</span>
          <span>🔴 Hazardous (&gt;55)</span>
        </Space>
      </div>

      {/* Info Banner */}
      <Card
        style={{
          marginTop: 16,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
          border: '1px solid #667eea40',
        }}
      >
        <Space direction="vertical" size={8}>
          <div style={{ fontWeight: 600, color: '#262626' }}>
            <EnvironmentOutlined style={{ marginRight: 8, color: '#667eea' }} />
            Real-time Mobile Sensor Tracking
          </div>
          <div style={{ fontSize: 13, color: '#595959' }}>
            Showing current positions of mobile air quality sensors. Positions update every 30 seconds.
            Historical route tracking will be available in the next update.
          </div>
        </Space>
      </Card>
    </div>
  );
};
