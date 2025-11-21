'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Button, Avatar, Dropdown } from 'antd';
import Image from 'next/image';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { Footer } from './Footer';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

type MainLayoutProps = {
  children: (activeView: string) => React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
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
      label: 'แผนที่แสดงคุณภาพอากาศ',
      title:
        'ศูนย์ข้อมูลเฝ้าระวังคุณภาพสิ่งแวดล้อมเมือง ศูนย์บริการวิชาการด้านศาสตร์เขตเมือง มหาวิทยาลัยนวมินทราธิราช',
    },
    {
      key: 'mobile-routes',
      label: 'เครื่องตรวจวัดคุณภาพอากาศแบบคลื่อนที่ชนิดติดตัวบุคคล',
      title:
        'ศูนย์ข้อมูลเฝ้าระวังคุณภาพสิ่งแวดล้อมเมือง ศูนย์บริการวิชาการด้านศาสตร์เขตเมือง มหาวิทยาลัยนวมินทราธิราช',
    },
    {
      key: 'analytics',
      label: 'ข้อมูลย้อนหลัง',
      title:
        'ศูนย์ข้อมูลเฝ้าระวังคุณภาพสิ่งแวดล้อมเมือง ศูนย์บริการวิชาการด้านศาสตร์เขตเมือง มหาวิทยาลัยนวมินทราธิราช',
    },
    {
      key: 'air-quality-info',
      label: 'ข้อมูลเกี่ยวกับคุณภาพอากาศ',
      title: 'ข้อมูลดัชนีคุณภาพอากาศและสารมลพิษทางอากาศ',
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
        width={430}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Image
                src="/logo.png"
                alt="Logo"
                width={48}
                height={48}
                style={{ objectFit: 'contain' }}
              />
              <div>
                <Title
                  level={4}
                  className="mb-0"
                  style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.3px' }}
                >
                  ศูนย์เฝ้าระวังคุณภาพอากาศ
                </Title>
                <Text style={{ fontSize: 12, color: '#666' }}>Urban Environmental Monitoring </Text>
              </div>
            </div>
          ) : (
            <Image
              src="/logo.png"
              alt="Logo"
              width={44}
              height={44}
              style={{ objectFit: 'contain' }}
            />
          )}
        </div>

        {/* Menu */}
        <div style={{ padding: '20px 16px', flex: 1 }}>
          <Menu
            mode="inline"
            selectedKeys={[activeView]}
            onClick={({ key }) => {
              setActiveView(key);
              // Auto-close sidebar after selecting a menu item
              setCollapsed(true);
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

        {/* Auth Section - Bottom of Sidebar */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #f0f0f0',
            background: 'white',
          }}
        >
          {user ? (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    label: 'ออกจากระบบ',
                    icon: <LoginOutlined />,
                    onClick: () => logout(),
                  },
                ],
              }}
              placement="topRight"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: '#f9fafb',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{ background: '#667eea', flexShrink: 0 }}
                  size={40}
                />
                {!collapsed && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      strong
                      style={{
                        fontSize: 14,
                        display: 'block',
                        color: '#1a1a1a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.username}
                    </Text>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้'}
                    </Text>
                  </div>
                )}
              </div>
            </Dropdown>
          ) : (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => setShowLoginModal(true)}
              size="large"
              block
              style={{
                height: 48,
                borderRadius: 12,
                background: '#00bcd4',
                border: 'none',
                fontWeight: 600,
              }}
            >
              {collapsed ? '' : 'เข้าสู่ระบบ'}
            </Button>
          )}
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
          color: #00bcd4 !important;
        }
        .modern-menu .ant-menu-item-selected {
          background: #00bcd4 !important;
          color: white !important;
          box-shadow: 0 6px 16px rgba(0, 188, 212, 0.4) !important;
        }
        .modern-menu .ant-menu-item-icon {
          font-size: 22px !important;
        }
      `}</style>

      {/* Overlay - Shows when sidebar is open */}
      {!collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            transition: 'opacity 0.2s',
            cursor: 'pointer',
          }}
        />
      )}

      {/* Main Content */}
      <Layout style={{ marginLeft: 0 }}>
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
                e.currentTarget.style.borderColor = '#00bcd4';
                e.currentTarget.style.color = '#00bcd4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
                        <Image
              src="/logo.png"
              alt="Logo"
              width={isMobile ? 36 : 48}
              height={isMobile ? 36 : 48}
              style={{ objectFit: 'contain' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {!isMobile && (
                <Text style={{ color: '#9ca3af', fontSize: 13, display: 'block', fontWeight: 600 }}>
                  {menuItems.find((item) => item.key === activeView)?.title}
                </Text>
              )}
              <Title
                level={3}
                style={{
                  margin: 0,
                  fontSize: isMobile ? 18 : 24,
                  fontWeight: 700,
                  color: '#1a1a1a',
                  letterSpacing: '-0.5px',
                }}
              >
                {menuItems.find((item) => item.key === activeView)?.label}
              </Title>
            </div>
          </div>
        </div>

        {/* Login Modal */}
        <LoginModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} />

        {/* Content Area */}
        <Content
          style={{
            height: 'calc(100vh - 80px)',
            overflow: 'auto',
            background: '#f5f7fa',
          }}
        >
          {children(activeView)}
          <Footer />
        </Content>
      </Layout>
    </Layout>
  );
};
