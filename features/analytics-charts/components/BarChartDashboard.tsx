'use client';

import { Row, Col, Typography } from 'antd';
import { SensorData } from '@/types/sensor';
import { BarChartPanel } from './BarChartPanel';

const { Title, Text } = Typography;

type BarChartDashboardProps = {
  sensors: SensorData[];
};

export const BarChartDashboard = ({ sensors }: BarChartDashboardProps) => {
  // Get first available sensors for defaults
  const indoorSensor = sensors.find((s) => s.type === 'indoor');
  const outdoorSensor = sensors.find((s) => s.type === 'outdoor');
  const defaultSensor = indoorSensor || outdoorSensor || sensors[0];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Analytics Dashboard
        </Title>
        <Text type="secondary">
          Real-time parameter monitoring with customizable time ranges
        </Text>
      </div>

      {/* 2x2 Grid of Charts */}
      <Row gutter={[16, 16]}>
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
