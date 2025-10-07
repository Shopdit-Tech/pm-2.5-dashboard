'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Badge } from 'antd';
import {
  EnvironmentOutlined,
  LineChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

type MainLayoutProps = {
  children: (activeView: string) => React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<string>('static-sensors');
  const [isMobile, setIsMobile] = useState(false);

  // Load saved view from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('activeView');
    if (savedView) {
      setActiveView(savedView);
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save view to localStorage when changed
  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

  const menuItems = [
    {
      key: 'static-sensors',
      icon: <EnvironmentOutlined />,
      label: 'Static Sensors',
      title: 'แผนที่เซ็นเซอร์ติดตั้ง',
    },
    {
      key: 'mobile-routes',
      icon: <LineChartOutlined />,
      label: 'Mobile Routes',
      title: 'เส้นทางอุปกรณ์เคลื่อนที่',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          background: 'linear-gradient(180deg, #1a2332 0%, #0f1419 100%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        }}
        trigger={null}
      >
        {/* Logo/Title */}
        <div
          className="flex items-center justify-center p-6"
          style={{
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
          }}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <DashboardOutlined style={{ fontSize: 28, color: 'white' }} />
              <div>
                <Title level={4} className="mb-0 text-white" style={{ fontSize: 18, fontWeight: 600 }}>
                  Air Quality
                </Title>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Monitoring System</Text>
              </div>
            </div>
          ) : (
            <DashboardOutlined style={{ fontSize: 28, color: 'white' }} />
          )}
        </div>

        {/* Menu */}
        <div style={{ padding: '24px 12px' }}>
          <Menu
            mode="inline"
            selectedKeys={[activeView]}
            onClick={({ key }) => setActiveView(key)}
            items={menuItems}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 15,
            }}
            className="modern-menu"
          />
        </div>
      </Sider>

      {/* Add custom styles for modern menu */}
      <style jsx global>{`
        .modern-menu .ant-menu-item {
          border-radius: 12px !important;
          margin: 8px 0 !important;
          height: 48px !important;
          line-height: 48px !important;
          color: rgba(255, 255, 255, 0.7) !important;
          font-weight: 500 !important;
        }
        .modern-menu .ant-menu-item:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          color: white !important;
        }
        .modern-menu .ant-menu-item-selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
        }
        .modern-menu .ant-menu-item-icon {
          font-size: 20px !important;
        }
      `}</style>

      {/* Main Content */}
      <Layout style={{ marginLeft: collapsed ? (isMobile ? 0 : 80) : 260, transition: 'margin-left 0.2s' }}>
        {/* Header with toggle button */}
        <div
          style={{
            height: '80px',
            padding: '0 32px',
            background: 'white',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '18px',
                border: '1px solid #e8e8e8',
                background: 'white',
                cursor: 'pointer',
                color: '#595959',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                transition: 'all 0.3s',
                width: '44px',
                height: '44px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.borderColor = '#d9d9d9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e8e8e8';
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Title 
                level={4} 
                style={{ 
                  margin: 0, 
                  color: '#262626', 
                  fontSize: 20, 
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                {menuItems.find((item) => item.key === activeView)?.title}
              </Title>
              <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.3 }}>
                {menuItems.find((item) => item.key === activeView)?.label}
              </Text>
            </div>
          </div>
          
          {/* Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Badge 
              status="success" 
              text="System Online" 
              style={{ 
                fontSize: 14, 
                fontWeight: 500,
              }} 
            />
          </div>
        </div>

        {/* Content Area */}
        <Content
          style={{
            height: 'calc(100vh - 80px)',
            overflow: 'auto',
            background: '#f5f7fa',
          }}
        >
          {children(activeView)}
        </Content>
      </Layout>
    </Layout>
  );
};
