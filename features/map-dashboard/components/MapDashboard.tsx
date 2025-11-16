import { useState } from 'react';
import { Card, Button, Select, Tabs } from 'antd';
import { ReloadOutlined, EnvironmentOutlined, BarChartOutlined } from '@ant-design/icons';
import { GoogleMapComponent } from './GoogleMapComponent';
import { useSensorData } from '../hooks/useSensorData';
import { SensorDataTable } from '@/features/sensor-table/components/SensorDataTable';
import { PM25ComparisonTab } from './PM25ComparisonTab';
import { AirQualityLegend } from '@/components/AirQualityLegend';

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
    <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eef3 100%)', minHeight: '100%', padding: '16px 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 50px' }}>
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
                สถานี
              </span>
            ),
            children: (
              <>
                {/* Map Container - Hero Section */}
                <Card
                  style={{
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.95)',
                    marginBottom: 16,
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <div style={{ 
                    height: typeof window !== 'undefined' && window.innerWidth < 768 ? '300px' : '400px', 
                    minHeight: '300px'
                  }}>
                    <GoogleMapComponent 
                      sensors={sensors} 
                      selectedSensorId={selectedSensorId}
                    />
                  </div>
                </Card>

                {/* Legend */}
                <div style={{ marginBottom: 16 }}>
                  <AirQualityLegend showRanges compact />
                </div>

                {/* Info & Controls Card */}
                <Card
                  style={{
                    borderRadius: 12,
                    marginBottom: 24,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    background: 'rgba(255,255,255,0.95)',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Title and Refresh Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1a1a1a', marginBottom: '4px' }}>
                          การติดตามเซ็นเซอร์ติดตั้ง
                        </h3>
                        <p style={{ margin: 0, color: '#666', fontSize: 13 }}>
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
                          height: 38,
                          padding: '0 18px',
                          background: '#00bcd4',
                          borderColor: 'transparent',
                          color: 'white',
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(0,188,212,0.3)',
                          fontSize: '13px',
                        }}
                      >
                        รีเฟรช
                      </Button>
                    </div>

                    {/* Sensor Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>เลือกเซ็นเซอร์:</span>
                      <Select
                        style={{ minWidth: 280, flex: 1, maxWidth: 400 }}
                        placeholder="เลือกเซ็นเซอร์เพื่อดูตำแหน่งบนแผนที่"
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
                  </div>
                </Card>

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
                อันดับ PM2.5 สูงสุด
              </span>
            ),
            children: <PM25ComparisonTab />,
          },
        ]}
      />
      </div>
    </div>
  );
};
