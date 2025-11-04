'use client';

import { useState, useEffect } from 'react';
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

  const tabItems = [
    {
      key: 'bar-charts',
      label: (
        <span>
          <BarChartOutlined />
          กราฟแท่ง
        </span>
      ),
      children: <BarChartDashboard sensors={sensors} />,
    },
    {
      key: 'historical-trends',
      label: (
        <span>
          <LineChartOutlined />
          กราฟเปรียบเทียบ
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
        size={isMobile ? 'middle' : 'large'}
        style={{
          padding: isMobile ? '0 16px' : '0 24px',
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
