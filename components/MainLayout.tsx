'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Badge, Button, Avatar, Dropdown, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from './LoginModal';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

type MainLayoutProps = {
  children: (activeView: string) => React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<string>('static-sensors');
  const [isMobile, setIsMobile] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const baseMenuItems = [
    {
      key: 'static-sensors',
      label: 'เซ็นเซอร์ติดตั้ง',
      title: 'แผนที่เซ็นเซอร์ติดตั้ง',
    },
    {
      key: 'mobile-routes',
      label: 'เส้นทางเคลื่อนที่',
      title: 'เส้นทางอุปกรณ์เคลื่อนที่',
    },
    // {
    //   key: 'sensor-data-table',
    //   label: 'ตารางข้อมูล',
    //   title: 'ตารางข้อมูลเซ็นเซอร์',
    // },
    // {
    //   key: 'mobile-data-table',
    //   label: 'ข้อมูลเคลื่อนที่',
    //   title: 'ตารางข้อมูลอุปกรณ์เคลื่อนที่',
    // },
    {
      key: 'analytics',
      label: 'การวิเคราะห์',
      title: 'กราฟวิเคราะห์',
    },
  ];

  // Add admin menu items for admin users
  const menuItems = isAdmin
    ? [
        ...baseMenuItems,
        {
          key: 'data-export',
          label: 'ส่งออกข้อมูล',
          title: 'ส่งออกข้อมูล',
        },
        {
          key: 'admin-settings',
          label: 'การตั้งค่าผู้ดูแล',
          title: 'การตั้งค่าระบบ',
        },
      ]
    : baseMenuItems;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        collapsedWidth={0}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
          zIndex: 1000,
          overflow: 'auto',
          transition: 'all 0.2s',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: '80px',
            padding: '24px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          {!collapsed ? (
            <div>
              <Title level={4} className="mb-0" style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.3px' }}>
                ศูนย์ข้อมูลคุณภาพอากาศ
              </Title>
            </div>
          ) : (
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
              fontSize: '18px',
              fontWeight: 700,
              color: 'white'
            }}>
              AQ
            </div>
          )}
        </div>

        {/* Menu */}
        <div style={{ padding: '20px 16px' }}>
          <Menu
            mode="inline"
            selectedKeys={[activeView]}
            onClick={({ key }) => {
              setActiveView(key);
              // Auto-close sidebar on mobile after selecting a menu item
              if (isMobile) {
                setCollapsed(true);
              }
            }}
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
          margin: 6px 0 !important;
          height: 52px !important;
          line-height: 52px !important;
          color: #6b7280 !important;
          font-weight: 600 !important;
          padding: 0 16px !important;
          transition: all 0.2s !important;
        }
        .modern-menu .ant-menu-item:hover {
          background: #f3f4f6 !important;
          color: #667eea !important;
        }
        .modern-menu .ant-menu-item-selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          box-shadow: 0 6px 16px rgba(102,126,234,0.4) !important;
        }
        .modern-menu .ant-menu-item-icon {
          font-size: 22px !important;
        }
      `}</style>

      {/* Main Content */}
      <Layout style={{ marginLeft: collapsed ? 0 : 280, transition: 'margin-left 0.2s' }}>
        {/* Header with toggle button */}
        <div
          style={{
            height: '80px',
            padding: isMobile ? '0 16px' : '0 40px',
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20 }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: isMobile ? '18px' : '20px',
                border: '1px solid #e5e7eb',
                background: 'white',
                cursor: 'pointer',
                color: '#6b7280',
                padding: isMobile ? '10px' : '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                transition: 'all 0.2s',
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.color = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {!isMobile && (
                <Text style={{ color: '#9ca3af', fontSize: 13, display: 'block', fontWeight: 600 }}>
                  {menuItems.find((item) => item.key === activeView)?.title}
                </Text>
              )}
              <Title level={3} style={{ margin: 0, fontSize: isMobile ? 18 : 24, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                {menuItems.find((item) => item.key === activeView)?.label}
              </Title>
            </div>
          </div>
          
          {/* Auth Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!isMobile && (
              <Badge 
                status="success" 
                text="System Online" 
                style={{ 
                  fontSize: 14, 
                  fontWeight: 500,
                  marginRight: 12,
                }} 
              />
            )}
            
            {user ? (
              <Dropdown
                menu={{
                  items: [
                    ...(isAdmin
                      ? [
                          {
                            key: 'admin',
                            label: 'การตั้งค่าผู้ดูแล',
                            onClick: () => {
                              setActiveView('admin-settings');
                              // Auto-close sidebar on mobile
                              if (isMobile) {
                                setCollapsed(true);
                              }
                            },
                          },
                          { type: 'divider' as const },
                        ]
                      : []),
                    {
                      key: 'logout',
                      label: 'ออกจากระบบ',
                      onClick: () => logout(),
                    },
                  ],
                }}
                placement="bottomRight"
              >
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} style={{ background: '#1890ff' }} />
                  {!isMobile && (
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                      <Text strong style={{ fontSize: 14 }}>{user.username}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้'}
                      </Text>
                    </div>
                  )}
                </Space>
              </Dropdown>
            ) : (
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => setShowLoginModal(true)}
                size={isMobile ? 'middle' : 'large'}
              >
                {isMobile ? '' : 'เข้าสู่ระบบ'}
              </Button>
            )}
          </div>
        </div>
        
        {/* Login Modal */}
        <LoginModal
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />

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
