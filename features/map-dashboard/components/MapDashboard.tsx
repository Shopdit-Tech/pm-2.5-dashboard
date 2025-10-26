import { useState } from 'react';
import { Card, Alert, Button, Space, Tag, Row, Col } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { GoogleMapComponent } from './GoogleMapComponent';
import { useSensorData } from '../hooks/useSensorData';

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
    <div style={{ padding: '32px', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eef3 100%)', minHeight: '100%' }}>
      {/* Header */}
      <div className="mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
            Static Sensor Monitoring
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: 15 }}>
            Real-time PM2.5 and air quality parameters
          </p>
        </div>
        <Button
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={handleRefresh}
          loading={refreshing}
          size="large"
          style={{
            borderRadius: 12,
            height: 48,
            padding: '0 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderColor: 'transparent',
            color: 'white',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
          }}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[20, 20]} className="mb-8">
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
              backdropFilter: 'blur(10px)',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ fontSize: 13, color: '#666', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sensors</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#667eea', marginBottom: 4 }}>{sensors.length}</div>
            <div style={{ fontSize: 12, color: '#999' }}>monitoring points</div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              background: 'linear-gradient(135deg, rgba(82,196,26,0.1) 0%, rgba(115,209,61,0.1) 100%)',
              backdropFilter: 'blur(10px)',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ fontSize: 13, color: '#666', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Online Status</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#52c41a', marginBottom: 4 }}>{onlineSensors.length}</div>
            <div style={{ fontSize: 12, color: '#999' }}>of {sensors.length} active</div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              background: 'linear-gradient(135deg, rgba(24,144,255,0.08) 0%, rgba(24,144,255,0.05) 100%)',
              backdropFilter: 'blur(10px)',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ marginBottom: 8 }}>
              <Tag color="blue" style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 600, border: 'none' }}>🏠 Indoor</Tag>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#1890ff', marginBottom: 4 }}>{avgPM25Indoor.toFixed(1)}</div>
            <div style={{ fontSize: 12, color: '#999' }}>µg/m³ avg PM2.5</div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              background: 'linear-gradient(135deg, rgba(82,196,26,0.08) 0%, rgba(82,196,26,0.05) 100%)',
              backdropFilter: 'blur(10px)',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ marginBottom: 8 }}>
              <Tag color="green" style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 600, border: 'none' }}>🌳 Outdoor</Tag>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#52c41a', marginBottom: 4 }}>{avgPM25Outdoor.toFixed(1)}</div>
            <div style={{ fontSize: 12, color: '#999' }}>µg/m³ avg PM2.5</div>
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
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.95)',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ height: 'calc(100vh - 380px)', minHeight: '600px' }}>
          <GoogleMapComponent sensors={sensors} />
        </div>
      </Card>

      {/* Legend */}
      <div
        style={{
          marginTop: 20,
          textAlign: 'center',
          padding: '16px 24px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <Space size="large">
          <span style={{ color: '#52c41a', fontWeight: 600, fontSize: 14 }}>● Good (0-12)</span>
          <span style={{ color: '#faad14', fontWeight: 600, fontSize: 14 }}>● Moderate (12-35)</span>
          <span style={{ color: '#fa8c16', fontWeight: 600, fontSize: 14 }}>● Unhealthy (35-55)</span>
          <span style={{ color: '#f5222d', fontWeight: 600, fontSize: 14 }}>● Hazardous (&gt;55)</span>
        </Space>
      </div>
    </div>
  );
};
