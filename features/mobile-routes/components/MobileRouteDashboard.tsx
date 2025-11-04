'use client';

import { useState } from 'react';
import { Card, Select, DatePicker, Space, Typography, Row, Col } from 'antd';
import { CarOutlined, EnvironmentOutlined, DashboardOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { MOCK_ROUTES } from '../services/mockRouteData';
import { RouteMap } from './RouteMap';
import { RouteTimeline, useRoutePlayback } from './RouteTimeline';
import { formatDuration } from '../utils/routeUtils';

const { Text } = Typography;

export const MobileRouteDashboard = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(MOCK_ROUTES[0]?.id || '');
  
  const selectedRoute = MOCK_ROUTES.find((r) => r.id === selectedRouteId);
  
  // Playback controls
  const {
    currentIndex,
    setCurrentIndex,
    isPlaying,
    togglePlayPause,
  } = useRoutePlayback(selectedRoute || MOCK_ROUTES[0], 1, 300);

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
            การตั้งค่าเส้นทาง
          </Typography.Title>
          <Text type="secondary" style={{ fontSize: 13 }}>เลือกอุปกรณ์และวันที่เพื่อดูข้อมูลเส้นทาง</Text>
        </div>
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} sm={12} md={12}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text strong style={{ fontSize: 13, color: '#595959' }}>
                <CarOutlined style={{ marginRight: 6 }} />
                อุปกรณ์
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
                วันที่
              </Text>
              <DatePicker 
                size="large"
                style={{ width: '100%' }} 
                format="DD/MM/YYYY" 
                placeholder="เลือกวันที่" 
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
                รวมระยะทาง
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
                รวมระยะเวลา
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
                PM2.5 เฉลี่ย
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
                PM2.5 สูงสุด
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
    </div>
  );
};
