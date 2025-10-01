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
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                <EnvironmentOutlined className="mr-2" />
                แผนที่ติดตามคุณภาพอากาศ
              </h1>
              <p className="text-gray-500">
                แสดงค่า PM2.5 และพารามิเตอร์คุณภาพอากาศแบบเรียลไทม์
              </p>
            </div>
            <Button
              type="primary"
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={handleRefresh}
              loading={refreshing}
            >
              รีเฟรช
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="เซ็นเซอร์ทั้งหมด"
                value={sensors.length}
                suffix="จุด"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="ออนไลน์"
                value={onlineSensors.length}
                suffix={`/ ${sensors.length}`}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="PM2.5 เฉลี่ย (ในอาคาร)"
                value={avgPM25Indoor.toFixed(1)}
                suffix="µg/m³"
                valueStyle={{ fontSize: '20px' }}
                prefix={
                  <Tag color={getParameterLevel('pm25', avgPM25Indoor) === 'good' ? 'green' : 'orange'}>
                    {getLevelLabel(getParameterLevel('pm25', avgPM25Indoor))}
                  </Tag>
                }
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="PM2.5 เฉลี่ย (นอกอาคาร)"
                value={avgPM25Outdoor.toFixed(1)}
                suffix="µg/m³"
                valueStyle={{ fontSize: '20px' }}
                prefix={
                  <Tag color={getParameterLevel('pm25', avgPM25Outdoor) === 'good' ? 'green' : 'orange'}>
                    {getLevelLabel(getParameterLevel('pm25', avgPM25Outdoor))}
                  </Tag>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Alert
            message="เกิดข้อผิดพลาด"
            description="ไม่สามารถโหลดข้อมูลเซ็นเซอร์ได้ กรุณาลองใหม่อีกครั้ง"
            type="error"
            closable
            className="mb-4"
          />
        )}

        {/* Offline Sensors Warning */}
        {offlineSensors.length > 0 && (
          <Alert
            message={`มีเซ็นเซอร์ออฟไลน์ ${offlineSensors.length} จุด`}
            description={
              <Space size={[8, 8]} wrap>
                {offlineSensors.map((sensor) => (
                  <Tag key={sensor.id} color="red">
                    {sensor.name}
                  </Tag>
                ))}
              </Space>
            }
            type="warning"
            closable
            className="mb-4"
          />
        )}

        {/* Map Legend */}
        <Card className="mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-medium">คำอธิบาย:</span>
            <Space>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-sm">ดี (0-12)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span className="text-sm">ปานกลาง (12-35)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <span className="text-sm">ไม่ดี (35-55)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-sm">อันตราย ({'>'}55)</span>
              </div>
            </Space>
          </div>
        </Card>

        {/* Map Container */}
        <Card className="shadow-lg" bodyStyle={{ padding: 0 }}>
          <div style={{ height: 'calc(100vh - 480px)', minHeight: '500px' }}>
            <GoogleMapComponent sensors={sensors} />
          </div>
        </Card>

        {/* Footer Info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            ข้อมูลอัพเดทอัตโนมัติทุก 60 วินาที | คลิกที่จุดบนแผนที่เพื่อดูรายละเอียด
          </p>
        </div>
      </Content>
    </Layout>
  );
};
