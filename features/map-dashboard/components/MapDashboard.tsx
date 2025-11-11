import { useState } from 'react';
import { Card, Alert, Button, Row, Col, Select } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { GoogleMapComponent } from './GoogleMapComponent';
import { useSensorData } from '../hooks/useSensorData';
import { SensorDataTable } from '@/features/sensor-table/components/SensorDataTable';

const { Option } = Select;

export const MapDashboard = () => {
  const { sensors, error, refetch } = useSensorData(60000); // Auto-refresh every 60 seconds
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Calculate statistics
  const onlineSensors = sensors.filter((s) => s.status === 'online');
  const offlineSensors = sensors.filter((s) => s.status === 'offline');

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
        <Col xs={12} sm={12} md={12}>
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
        <Col xs={12} sm={12} md={12}>
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

      {/* Sensor Selector */}
      <Card
        style={{
          borderRadius: 12,
          marginBottom: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: '#1a1a1a' }}>เลือกเซ็นเซอร์:</span>
          <Select
            style={{ minWidth: 250, flex: 1 }}
            placeholder="เลือกเซ็นเซอร์เพื่อดูตำแหน่ง"
            allowClear
            showSearch
            optionFilterProp="children"
            value={selectedSensorId}
            onChange={(value) => setSelectedSensorId(value)}
          >
            {sensors.map((sensor) => (
              <Option key={sensor.id} value={sensor.id}>
                {sensor.name} {sensor.status === 'offline' ? '(offline)' : ''}
              </Option>
            ))}
          </Select>
        </div>
      </Card>

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
          height: typeof window !== 'undefined' && window.innerWidth < 768 ? '400px' : 'calc(100vh - 480px)', 
          minHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? '400px' : '500px' 
        }}>
          <GoogleMapComponent 
            sensors={sensors} 
            selectedSensorId={selectedSensorId}
          />
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
          <span style={{ color: '#52c41a', fontWeight: 600 }}>● ดีมาก (0-12)</span>
          <span style={{ color: '#faad14', fontWeight: 600 }}>● ปานกลาง (12-35)</span>
          <span style={{ color: '#fa8c16', fontWeight: 600 }}>● เริ่มมีผลต่อสุขภาพ (35-55)</span>
          <span style={{ color: '#f5222d', fontWeight: 600 }}>● อันตรายต่อสุขภาพ (&gt;55)</span>
        </div>
      </div>

      {/* Sensor Data Table */}
      <div style={{ marginTop: 24 }}>
        <SensorDataTable />
      </div>
    </div>
  );
};
