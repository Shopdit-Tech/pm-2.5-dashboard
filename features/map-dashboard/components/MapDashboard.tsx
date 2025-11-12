import { useState } from 'react';
import { Card, Button, Select, Tabs } from 'antd';
import { ReloadOutlined, EnvironmentOutlined, BarChartOutlined } from '@ant-design/icons';
import { GoogleMapComponent } from './GoogleMapComponent';
import { useSensorData } from '../hooks/useSensorData';
import { SensorDataTable } from '@/features/sensor-table/components/SensorDataTable';
import { PM25ComparisonTab } from './PM25ComparisonTab';

const { Option } = Select;

export const MapDashboard = () => {
  const { sensors, refetch } = useSensorData(60000); // Auto-refresh every 60 seconds
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('map');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

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
          {activeTab === 'map' && (
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
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        items={[
          {
            key: 'map',
            label: (
              <span>
                <EnvironmentOutlined style={{ marginRight: 6 }} />
                แผนที่เซ็นเซอร์
              </span>
            ),
            children: (
              <>
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
                    <span style={{ color: '#52c41a', fontWeight: 600 }}>● ดีมาก (0-25)</span>
                    <span style={{ color: '#faad14', fontWeight: 600 }}>● ปานกลาง (25-37.5)</span>
                    <span style={{ color: '#fa8c16', fontWeight: 600 }}>● เริ่มมีผลต่อสุขภาพ (37.5-55)</span>
                    <span style={{ color: '#f5222d', fontWeight: 600 }}>● อันตรายต่อสุขภาพ (&gt;55)</span>
                  </div>
                </div>

                {/* Sensor Data Table */}
                <div style={{ marginTop: 24 }}>
                  <SensorDataTable />
                </div>
              </>
            ),
          },
          {
            key: 'comparison',
            label: (
              <span>
                <BarChartOutlined style={{ marginRight: 6 }} />
                เปรียบเทียบ PM2.5
              </span>
            ),
            children: <PM25ComparisonTab />,
          },
        ]}
      />
    </div>
  );
};
