'use client';

import { Tabs } from 'antd';
import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons';
import { SensorData } from '@/types/sensor';
import { BarChartDashboard } from './BarChartDashboard';
import { MultiLocationLineChart } from './MultiLocationLineChart';
import { ProtectedRoute } from '@/components/ProtectedRoute';

type AnalyticsViewProps = {
  sensors: SensorData[];
};

export const AnalyticsView = ({ sensors }: AnalyticsViewProps) => {
  const tabItems = [
    {
      key: 'bar-charts',
      label: (
        <span>
          <BarChartOutlined />
          Bar Charts
        </span>
      ),
      children: <BarChartDashboard sensors={sensors} />,
    },
    {
      key: 'historical-trends',
      label: (
        <span>
          <LineChartOutlined />
          Historical Trends
        </span>
      ),
      children: (
        <ProtectedRoute>
          <MultiLocationLineChart sensors={sensors} />
        </ProtectedRoute>
      ),
    },
  ];

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <Tabs
        defaultActiveKey="bar-charts"
        items={tabItems}
        size="large"
        style={{
          padding: '0 24px',
          background: 'white',
          marginBottom: 0,
        }}
        tabBarStyle={{
          marginBottom: 0,
          fontWeight: 500,
        }}
      />
    </div>
  );
};
