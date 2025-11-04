'use client';

import { useState, useEffect } from 'react';
import { Tabs, Card } from 'antd';
import { UserOutlined, SettingOutlined, BgColorsOutlined } from '@ant-design/icons';
import { UserManagement } from './UserManagement';
import { SensorConfiguration } from './SensorConfiguration';
import { ThresholdConfiguration } from './ThresholdConfiguration';

export const AdminSettings = () => {
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
          เซ็นเซอร์
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
          ค่าเกณฑ์
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
    <div style={{ padding: isMobile ? '16px' : '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <h2 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 600 }}>
          การตั้งค่าผู้ดูแล
        </h2>
        <p style={{ margin: 0, color: '#8c8c8c', fontSize: isMobile ? 12 : 14 }}>
          {isMobile ? 'จัดการการตั้งค่าระบบ' : 'จัดการผู้ใช้ เซ็นเซอร์ และการตั้งค่าระบบ'}
        </p>
      </div>

      <Tabs
        defaultActiveKey="users"
        items={tabItems}
        size={isMobile ? 'middle' : 'large'}
        style={{ background: 'transparent' }}
      />
    </div>
  );
};
