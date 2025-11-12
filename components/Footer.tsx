'use client';

import { Typography, Row, Col } from 'antd';
import Image from 'next/image';
import { PhoneOutlined } from '@ant-design/icons';
import { usePageViews } from '@/hooks/usePageViews';

const { Text, Link } = Typography;

export const Footer = () => {
  const pageViews = usePageViews();

  return (
    <footer
      style={{
        background: '#ffffff',
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
        <Row gutter={[48, 32]} align="middle">
          {/* Logo and Organization Info */}
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
              <Image
                src="/logo.png"
                alt="Logo"
                width={80}
                height={80}
                style={{ objectFit: 'contain', flexShrink: 0 }}
              />
              <div>
                <Text strong style={{ display: 'block', fontSize: 15, color: '#1a1a1a', marginBottom: 6 }}>
                  ศูนย์บริการวิชาการด้านศาสตร์เขตเมือง
                </Text>
                <Text style={{ display: 'block', fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 12 }}>
                  Academic Service Center of Urbanology (ASCU)
                  <br />
                  มหาวิทยาลัยนวมินทราธิราช (NMU)
                  <br />
                  เลขที่ 3 ถนนขาว แขวงวชิรพยาบาล เขตดุสิต กทม. 10300
                </Text>
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                  © {new Date().getFullYear()} Urban Environmental Monitoring. All Rights Reserved.
                </Text>
              </div>
            </div>
          </Col>

          {/* Contact Information */}
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
              <div>
                <Text strong style={{ display: 'block', fontSize: 14, color: '#1a1a1a', marginBottom: 12 }}>
                  ติดต่อเรา
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PhoneOutlined style={{ color: '#00bcd4', fontSize: 16 }} />
                    <Text style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>
                      02-244-3000 ต่อ 5852
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PhoneOutlined style={{ color: '#00bcd4', fontSize: 16 }} />
                    <Text style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>
                      064-415-5852
                    </Text>
                  </div>
                  {/* <div style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 13, color: '#00bcd4', fontWeight: 500 }}>
                      👁️ Visitors: {pageViews.allTime.toLocaleString()} • Today: {pageViews.today}
                    </Text>
                  </div> */}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </footer>
  );
};
