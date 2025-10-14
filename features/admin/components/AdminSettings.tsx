'use client';

import { Tabs, Card } from 'antd';
import { UserOutlined, SettingOutlined, BgColorsOutlined } from '@ant-design/icons';
import { UserManagement } from './UserManagement';
import { SensorConfiguration } from './SensorConfiguration';
import { ThresholdConfiguration } from './ThresholdConfiguration';

export const AdminSettings = () => {
  const tabItems = [
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          User Management
        </span>
      ),
      children: (
        <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <UserManagement />
        </Card>
      ),
    },
    {
      key: 'sensors',
      label: (
        <span>
          <SettingOutlined />
          Sensor Configuration
        </span>
      ),
      children: (
        <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <SensorConfiguration />
        </Card>
      ),
    },
    {
      key: 'thresholds',
      label: (
        <span>
          <BgColorsOutlined />
          Threshold Configuration
        </span>
      ),
      children: (
        <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <ThresholdConfiguration />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
          Admin Settings
        </h2>
        <p style={{ margin: 0, color: '#8c8c8c', fontSize: 14 }}>
          Manage users, sensors, and system configuration
        </p>
      </div>

      <Tabs
        defaultActiveKey="users"
        items={tabItems}
        size="large"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};
