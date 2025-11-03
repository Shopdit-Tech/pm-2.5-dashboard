'use client';

import { useState, useEffect } from 'react';
import { Row, Col, Typography } from 'antd';
import { SensorData } from '@/types/sensor';
import { BarChartPanel } from './BarChartPanel';

const { Title, Text } = Typography;

type BarChartDashboardProps = {
  sensors: SensorData[];
};

export const BarChartDashboard = ({ sensors }: BarChartDashboardProps) => {
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get first available sensors for defaults
  const indoorSensor = sensors.find((s) => s.type === 'indoor');
  const outdoorSensor = sensors.find((s) => s.type === 'outdoor');
  const defaultSensor = indoorSensor || outdoorSensor || sensors[0];

  return (
    <div style={{ padding: isMobile ? '16px' : '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Title level={4} style={{ margin: 0, fontSize: isMobile ? 18 : 24 }}>
          Analytics Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
          {isMobile ? 'Real-time monitoring' : 'Real-time parameter monitoring with customizable time ranges'}
        </Text>
      </div>

      {/* 2x2 Grid of Charts */}
      <Row gutter={isMobile ? [12, 12] : [16, 16]}>
        <Col xs={24} lg={12}>
          <BarChartPanel
            sensors={sensors}
            defaultParameter="pm25"
            defaultSensorId={defaultSensor?.id}
            defaultTimeRange="7d"
          />
        </Col>

        <Col xs={24} lg={12}>
          <BarChartPanel
            sensors={sensors}
            defaultParameter="co2"
            defaultSensorId={defaultSensor?.id}
            defaultTimeRange="7d"
          />
        </Col>

        <Col xs={24} lg={12}>
          <BarChartPanel
            sensors={sensors}
            defaultParameter="temperature"
            defaultSensorId={defaultSensor?.id}
            defaultTimeRange="7d"
          />
        </Col>

        <Col xs={24} lg={12}>
          <BarChartPanel
            sensors={sensors}
            defaultParameter="humidity"
            defaultSensorId={defaultSensor?.id}
            defaultTimeRange="7d"
          />
        </Col>
      </Row>
    </div>
  );
};
