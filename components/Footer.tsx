'use client';

import { Typography, Row, Col } from 'antd';
import { PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { usePageViews } from '@/hooks/usePageViews';

const { Text, Link } = Typography;

export const Footer = () => {
  const pageViews = usePageViews();

  return (
    <footer
      style={{
        background: '#f7f9fc',
        borderTop: '1px solid #e5e7eb',
        padding: '32px 20px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <Row gutter={[32, 24]}>
          {/* Logo and Address */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: 12 }}>
              {/* BMA Logo placeholder */}
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: '#2ca58d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <EnvironmentOutlined style={{ fontSize: 32, color: 'white' }} />
              </div>
            </div>
            <Text strong style={{ display: 'block', fontSize: 14, color: '#1a1a1a', marginBottom: 8 }}>
              สำนักเลขานุการวิชาการ
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
              คณะวิทยาศาสตร์สุขภาพ และเทคโนโลยีสุขภาพ
              <br />
              มหาวิทยาลัยนวมินทราธิราช กทม. 10400
            </Text>
            <div style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                © {new Date().getFullYear()} Bangkok Air Quality,
                <br />
                ALL RIGHT RESERVED
              </Text>
            </div>
          </Col>

          {/* Contact Links */}
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: 'block', fontSize: 14, color: '#1a1a1a', marginBottom: 16 }}>
              ติดต่อเรา
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link href="#" style={{ fontSize: 13, color: '#6b7280' }}>
                สำนักที่เชื่อมต่อแล้ว
              </Link>
              <Link href="#" style={{ fontSize: 13, color: '#6b7280' }}>
                ศูนย์ข้อมูลคุณภาพอากาศ กรุงเทพมหานคร
              </Link>
              <Link href="#" style={{ fontSize: 13, color: '#6b7280' }}>
                คุณภาพอากาศและพารามิเตอร์
              </Link>
            </div>
          </Col>

          {/* Data Sources */}
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: 'block', fontSize: 14, color: '#1a1a1a', marginBottom: 16 }}>
              จังหวัดที่เชื่อมข้อง
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link href="#" style={{ fontSize: 13, color: '#6b7280' }}>
                Air BKK
              </Link>
              <Link href="#" style={{ fontSize: 13, color: '#6b7280' }}>
                Windy
              </Link>
              <Link href="#" style={{ fontSize: 13, color: '#6b7280' }}>
                NASA Hotspot
              </Link>
              <Link href="#" style={{ fontSize: 13, color: '#6b7280' }}>
                Air4Thai
              </Link>
            </div>
          </Col>

          {/* External Links */}
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: 'block', fontSize: 14, color: '#1a1a1a', marginBottom: 16 }}>
              ศูนย์ข้อมูลคุณภาพอากาศอื่นในกรุงเทพมหานคร
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link href="#" style={{ fontSize: 13, color: '#6b7280' }}>
                SENSOR FOR ALL
              </Link>
              <Link href="#" style={{ fontSize: 13, color: '#6b7280' }}>
                Emission Inventory
              </Link>
              <Link href="#" style={{ fontSize: 13, color: '#6b7280' }}>
                จัดการระบบฐานข้อมูลการ
              </Link>
              <Link href="#" style={{ fontSize: 13, color: '#6b7280' }}>
                ข้อมูลธรรมชาติวิทยา
              </Link>
            </div>
          </Col>
        </Row>

        {/* Bottom Contact Info */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PhoneOutlined style={{ color: '#2ca58d' }} />
            <Text style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 600 }}>
              0-2203-2954
            </Text>
          </div>
          <Text style={{ fontSize: 13, color: '#2ca58d', fontWeight: 500 }}>
            Visitor {pageViews.allTime.toLocaleString()} time • Today {pageViews.today}
          </Text>
        </div>
      </div>
    </footer>
  );
};
