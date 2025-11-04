import { useState } from 'react';
import { Card, Alert, Button, Tag, Row, Col } from 'antd';
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
    <div style={{ padding: '16px', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eef3 100%)', minHeight: '100%' }}>
      {/* Header */}
      <div className="mb-6" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
              การติดตามเซ็นเซอร์ติดตั้ง
            </h2>
            <p style={{ margin: '6px 0 0 0', color: '#666', fontSize: 13 }}>
              ติดตาม PM2.5 และคุณภาพอากาศแบบเรียลไทม์
            </p>
          </div>
          <Button
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={handleRefresh}
            loading={refreshing}
            size="middle"
            style={{
              borderRadius: 10,
              height: 40,
              padding: '0 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderColor: 'transparent',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
              fontSize: '14px',
            }}
          >
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[12, 12]} className="mb-6">
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ fontSize: 11, color: '#666', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.3px' }}>เซ็นเซอร์ทั้งหมด</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#667eea', marginBottom: 2 }}>{sensors.length}</div>
            <div style={{ fontSize: 11, color: '#999' }}>จุดติดตาม</div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, rgba(82,196,26,0.1) 0%, rgba(115,209,61,0.1) 100%)',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ fontSize: 11, color: '#666', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.3px' }}>สถานะออนไลน์</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a', marginBottom: 2 }}>{onlineSensors.length}</div>
            <div style={{ fontSize: 11, color: '#999' }}>จาก {sensors.length} ที่ใช้งาน</div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, rgba(24,144,255,0.08) 0%, rgba(24,144,255,0.05) 100%)',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ marginBottom: 6 }}>
              <Tag color="blue" style={{ borderRadius: 6, padding: '3px 10px', fontWeight: 600, border: 'none', fontSize: '11px' }}>🏠 ภายใน</Tag>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#1890ff', marginBottom: 2 }}>{avgPM25Indoor.toFixed(1)}</div>
            <div style={{ fontSize: 11, color: '#999' }}>µg/m³ PM2.5 เฉลี่ย</div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, rgba(82,196,26,0.08) 0%, rgba(82,196,26,0.05) 100%)',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ marginBottom: 6 }}>
              <Tag color="green" style={{ borderRadius: 6, padding: '3px 10px', fontWeight: 600, border: 'none', fontSize: '11px' }}>🌳 ภายนอก</Tag>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#52c41a', marginBottom: 2 }}>{avgPM25Outdoor.toFixed(1)}</div>
            <div style={{ fontSize: 11, color: '#999' }}>µg/m³ PM2.5 เฉลี่ย</div>
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
          message={`${offlineSensors.length} เซ็นเซอร์ออฟไลน์`}
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
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.95)',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ 
          height: typeof window !== 'undefined' && window.innerWidth < 768 ? '400px' : 'calc(100vh - 380px)', 
          minHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? '400px' : '500px' 
        }}>
          <GoogleMapComponent sensors={sensors} />
        </div>
      </Card>

      {/* Legend */}
      <div
        style={{
          marginTop: 16,
          textAlign: 'center',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 12,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth < 768 ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '8px',
          fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? '12px' : '14px'
        }}>
          <span style={{ color: '#52c41a', fontWeight: 600 }}>● Good (0-12)</span>
          <span style={{ color: '#faad14', fontWeight: 600 }}>● Moderate (12-35)</span>
          <span style={{ color: '#fa8c16', fontWeight: 600 }}>● Unhealthy (35-55)</span>
          <span style={{ color: '#f5222d', fontWeight: 600 }}>● Hazardous (&gt;55)</span>
        </div>
      </div>
    </div>
  );
};
