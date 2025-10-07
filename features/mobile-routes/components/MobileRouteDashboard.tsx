'use client';

import { useState } from 'react';
import { Card, Select, DatePicker, Space, Typography, Row, Col, Modal } from 'antd';
import { CarOutlined, EnvironmentOutlined, DashboardOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { MOCK_ROUTES } from '../services/mockRouteData';
import { RouteMap } from './RouteMap';
import { RouteTimeline, useRoutePlayback } from './RouteTimeline';
import { formatDuration } from '../utils/routeUtils';
import { RoutePoint } from '@/types/route';
import { getParameterColor } from '@/utils/airQualityUtils';

const { Text } = Typography;

export const MobileRouteDashboard = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(MOCK_ROUTES[0]?.id || '');
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const selectedRoute = MOCK_ROUTES.find((r) => r.id === selectedRouteId);
  
  // Playback controls
  const {
    currentIndex,
    setCurrentIndex,
    isPlaying,
    togglePlayPause,
  } = useRoutePlayback(selectedRoute || MOCK_ROUTES[0], 1, 300);
  
  // Handle point click from map
  const handlePointClick = (point: RoutePoint) => {
    setSelectedPoint(point);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPoint(null);
  };

  return (
    <div className="p-6" style={{ background: '#f5f7fa', minHeight: '100%' }}>
      {/* Header Controls */}
      <Card 
        className="mb-6" 
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: 'none',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Title level={5} style={{ margin: 0, color: '#262626', fontSize: 18 }}>
            <CarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Route Configuration
          </Typography.Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Select device and date to view route data</Text>
        </div>
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} sm={12} md={12}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text strong style={{ fontSize: 13, color: '#595959' }}>
                <CarOutlined style={{ marginRight: 6 }} />
                Device
              </Text>
              <Select
                size="large"
                style={{ width: '100%' }}
                value={selectedRouteId}
                onChange={setSelectedRouteId}
                options={MOCK_ROUTES.map((route) => ({
                  label: route.deviceName,
                  value: route.id,
                }))}
              />
            </Space>
          </Col>
          
          <Col xs={24} sm={12} md={12}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text strong style={{ fontSize: 13, color: '#595959' }}>
                <ClockCircleOutlined style={{ marginRight: 6 }} />
                Date
              </Text>
              <DatePicker 
                size="large"
                style={{ width: '100%' }} 
                format="DD/MM/YYYY" 
                placeholder="Select date" 
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      {selectedRoute && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={12} md={6}>
            <Card 
              style={{ 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
                <EnvironmentOutlined style={{ marginRight: 6 }} />
                Total Distance
              </div>
              <div style={{ color: 'white', fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
                {selectedRoute.totalDistance}
                <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 6 }}>km</span>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card 
              style={{ 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(245, 87, 108, 0.3)',
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
                <ClockCircleOutlined style={{ marginRight: 6 }} />
                Duration
              </div>
              <div style={{ color: 'white', fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
                {formatDuration(
                  new Date(selectedRoute.endTime).getTime() - new Date(selectedRoute.startTime).getTime()
                )}
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card 
              style={{ 
                borderRadius: '16px',
                background: selectedRoute.averagePm25 > 50 
                  ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' 
                  : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                boxShadow: selectedRoute.averagePm25 > 50
                  ? '0 4px 16px rgba(250, 112, 154, 0.3)'
                  : '0 4px 16px rgba(79, 172, 254, 0.3)',
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
                <DashboardOutlined style={{ marginRight: 6 }} />
                Average PM2.5
              </div>
              <div style={{ color: 'white', fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
                {selectedRoute.averagePm25.toFixed(1)}
                <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 6 }}>µg/m³</span>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card 
              style={{ 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(252, 182, 159, 0.3)',
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'rgba(139, 69, 19, 0.8)', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
                Max PM2.5
              </div>
              <div style={{ color: '#8b4513', fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
                {selectedRoute.maxPm25.toFixed(1)}
                <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 6 }}>µg/m³</span>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Route Map */}
      {selectedRoute && (
        <Card 
          className="mb-6"
          style={{
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ height: 'calc(100vh - 500px)', minHeight: '450px' }}>
            <RouteMap 
              route={selectedRoute} 
              currentPointIndex={currentIndex}
              onPointClick={handlePointClick}
            />
          </div>
        </Card>
      )}

      {/* Timeline Controls */}
      {selectedRoute && (
        <Card 
          style={{
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <RouteTimeline
            route={selectedRoute}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            isPlaying={isPlaying}
            onPlayPause={togglePlayPause}
          />
        </Card>
      )}

      {/* Point Details Modal */}
      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={680}
        centered
        style={{
          borderRadius: '16px',
        }}
      >
        {selectedPoint && (
          <div>
            {/* Header with gradient */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '32px',
                margin: '-24px -24px 24px -24px',
                borderRadius: '16px 16px 0 0',
              }}
            >
              <Typography.Title level={4} style={{ margin: 0, color: 'white' }}>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Route Point Details
              </Typography.Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                {new Date(selectedPoint.timestamp).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </div>

            <Space direction="vertical" size="large" style={{ width: '100%', padding: '0 24px 24px' }}>
              {/* PM2.5 - Featured */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${getParameterColor('pm25', selectedPoint.pm25)}20, ${getParameterColor('pm25', selectedPoint.pm25)}10)`,
                  border: `2px solid ${getParameterColor('pm25', selectedPoint.pm25)}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 13, color: '#595959', marginBottom: 8, fontWeight: 500 }}>
                  <DashboardOutlined style={{ marginRight: 6 }} />
                  PM2.5 Level
                </div>
                <div
                  style={{ 
                    fontSize: 48, 
                    fontWeight: 700, 
                    color: getParameterColor('pm25', selectedPoint.pm25),
                    lineHeight: 1,
                  }}
                >
                  {selectedPoint.pm25.toFixed(1)}
                  <span style={{ fontSize: 20, fontWeight: 500, marginLeft: 8 }}>µg/m³</span>
                </div>
              </div>

              {/* Other Parameters */}
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #f0f0f0',
                      textAlign: 'center',
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>PM10</div>
                    <div
                      style={{ 
                        fontSize: 24, 
                        fontWeight: 700, 
                        color: getParameterColor('pm10', selectedPoint.pm10),
                      }}
                    >
                      {selectedPoint.pm10.toFixed(1)}
                      <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 4 }}>µg/m³</span>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #f0f0f0',
                      textAlign: 'center',
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>Temperature</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#ff7a45' }}>
                      {selectedPoint.temperature.toFixed(1)}
                      <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 4 }}>°C</span>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #f0f0f0',
                      textAlign: 'center',
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>Humidity</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1890ff' }}>
                      {selectedPoint.humidity.toFixed(1)}
                      <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 4 }}>%</span>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #f0f0f0',
                      textAlign: 'center',
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>CO2</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>
                      {selectedPoint.co2}
                      <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 4 }}>ppm</span>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #f0f0f0',
                      textAlign: 'center',
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>TVOC</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#722ed1' }}>
                      {selectedPoint.tvoc}
                      <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 4 }}>ppb</span>
                    </div>
                  </Card>
                </Col>
                {selectedPoint.speed && (
                  <Col span={12}>
                    <Card
                      style={{
                        borderRadius: '12px',
                        border: '1px solid #f0f0f0',
                        textAlign: 'center',
                      }}
                      bodyStyle={{ padding: '16px' }}
                    >
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>Speed</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#13c2c2' }}>
                        {selectedPoint.speed.toFixed(1)}
                        <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 4 }}>km/h</span>
                      </div>
                    </Card>
                  </Col>
                )}
              </Row>

              {/* Location */}
              <Card
                style={{
                  borderRadius: '12px',
                  background: '#fafafa',
                  border: '1px solid #f0f0f0',
                }}
                bodyStyle={{ padding: '16px' }}
              >
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  Location Coordinates
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#595959', fontFamily: 'monospace' }}>
                  {selectedPoint.latitude.toFixed(6)}, {selectedPoint.longitude.toFixed(6)}
                </div>
              </Card>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};
