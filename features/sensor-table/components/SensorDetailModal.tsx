'use client';

import { useState, useEffect } from 'react';
import { Modal, Typography, Card, Space, Row, Col, Tag, Button } from 'antd';
import { CopyOutlined, EnvironmentOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { SensorData } from '@/types/sensor';
import { message } from 'antd';

const { Text, Title } = Typography;

type SensorDetailModalProps = {
  sensor: SensorData;
  visible: boolean;
  onClose: () => void;
};

export const SensorDetailModal = ({ sensor, visible, onClose }: SensorDetailModalProps) => {
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

  // Copy serial number to clipboard
  const handleCopySerial = () => {
    if (sensor.serialNumber) {
      navigator.clipboard.writeText(sensor.serialNumber);
      message.success('Serial number copied to clipboard');
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={isMobile ? '95%' : 680}
      centered
      style={{
        borderRadius: '16px',
        maxWidth: isMobile ? '100vw' : undefined,
      }}
    >
      <div>
        {/* Header with gradient */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            padding: isMobile ? '20px 16px' : '32px',
            margin: '-24px -24px 24px -24px',
            borderRadius: '16px 16px 0 0',
          }}
        >
          <Title level={4} style={{ margin: 0, color: 'white', fontSize: isMobile ? 16 : 20 }}>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            Monitor Information
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: isMobile ? 12 : 14 }}>
            {isMobile ? 'Sensor details' : 'Detailed sensor specifications and calibration data'}
          </Text>
        </div>

        <Space direction="vertical" size={isMobile ? 'middle' : 'large'} style={{ width: '100%', padding: isMobile ? '0 16px 16px' : '0 24px 24px' }}>
          {/* General Information Section */}
          <Card
            style={{
              borderRadius: '12px',
              border: '1px solid #f0f0f0',
              background: '#fafafa',
            }}
            bodyStyle={{ padding: isMobile ? '16px' : '20px' }}
          >
            <Title level={5} style={{ marginTop: 0, marginBottom: isMobile ? 12 : 16, fontSize: 16 }}>
              General Information
            </Title>
            
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* Serial Number */}
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  Monitor Serial Number
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      fontFamily: 'monospace',
                      padding: '4px 12px',
                      background: 'white',
                      borderRadius: '6px',
                      border: '1px solid #d9d9d9',
                    }}
                  >
                    {sensor.code || 'N/A'}
                  </Text>
                  {sensor.code && (
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={handleCopySerial}
                      size="small"
                      style={{ color: '#1890ff' }}
                    />
                  )}
                </div>
              </div>


              <Row gutter={16}>
                {/* Model */}
                <Col xs={24} sm={12}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Model
                  </Text>
                  <Text strong style={{ fontSize: 15 }}>
                    {sensor.model || 'N/A'}
                  </Text>
                </Col>
              </Row>

              {/* Linked Location */}
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  ตำแหน่งที่
                </Text>
                <Text strong style={{ fontSize: 15 }}>
                  {sensor.type === 'indoor' ? 'ภายใน' : 'ภายนอก'} {sensor.name}
                </Text>
              </div>

              <Row gutter={16}>
                {/* Status */}
                <Col xs={24} sm={12}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    สถานะ
                  </Text>
                  <Tag color={sensor.status === 'online' ? 'success' : 'error'} style={{ fontSize: 13 }}>
                    {sensor.status.toUpperCase()}
                  </Tag>
                </Col>
              </Row>
            </Space>
          </Card>

          {/* Calibration Section */}
          {sensor.calibrationInfo && (
            <Card
              style={{
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                background: '#fafafa',
              }}
              bodyStyle={{ padding: isMobile ? '16px' : '20px' }}
            >
              <Title level={5} style={{ marginTop: 0, marginBottom: isMobile ? 12 : 16, fontSize: 16 }}>
                Calibration
              </Title>

              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* PM2.5 Calibration */}
                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    PM2.5Calibration Formulas Applied
                  </Text>
                  <ul style={{ marginLeft: 20, marginBottom: 0 }}>
                    {sensor.calibrationInfo.pm25Methods.map((method, index) => (
                      <li key={index}>
                        <Text style={{ fontSize: 14 }}>{method}</Text>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* PM10 Calibration (if available) */}
                {sensor.calibrationInfo.pm10Methods && sensor.calibrationInfo.pm10Methods.length > 0 && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                      PM₁₀ Calibration Formulas Applied
                    </Text>
                    <ul style={{ marginLeft: 20, marginBottom: 0 }}>
                      {sensor.calibrationInfo.pm10Methods.map((method, index) => (
                        <li key={index}>
                          <Text style={{ fontSize: 14 }}>{method}</Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Additional Notes */}
                {sensor.calibrationInfo.notes && (
                  <div
                    style={{
                      padding: '12px',
                      background: '#e6f7ff',
                      borderRadius: '8px',
                      border: '1px solid #91d5ff',
                    }}
                  >
                    <Text style={{ fontSize: 13, color: '#096dd9' }}>
                      <InfoCircleOutlined style={{ marginRight: 6 }} />
                      {sensor.calibrationInfo.notes}
                    </Text>
                  </div>
                )}
              </Space>
            </Card>
          )}

          {/* Current Readings Section */}
          {sensor.status === 'online' && (
            <Card
              style={{
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
              }}
              bodyStyle={{ padding: isMobile ? '16px' : '20px' }}
            >
              <Title level={5} style={{ marginTop: 0, marginBottom: isMobile ? 12 : 16, fontSize: 16 }}>
                ค่าวัดปัจจุบัน
              </Title>

              <Row gutter={[12, 12]} justify="center">
                <Col xs={8} sm={8}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: isMobile ? '10px 6px' : '12px', 
                    background: '#fafafa', 
                    borderRadius: '8px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                      PM₂.₅
                    </Text>
                    <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: '#1890ff' }}>
                      {sensor.pm25.toFixed(1)}
                    </div>
                    <Text type="secondary" style={{ fontSize: 10 }}>μg/m³</Text>
                  </div>
                </Col>
                <Col xs={8} sm={8}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: isMobile ? '10px 6px' : '12px', 
                    background: '#fafafa', 
                    borderRadius: '8px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                      PM₁₀
                    </Text>
                    <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: '#52c41a' }}>
                      {sensor.pm10.toFixed(1)}
                    </div>
                    <Text type="secondary" style={{ fontSize: 10 }}>μg/m³</Text>
                  </div>
                </Col>
                <Col xs={8} sm={8}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: isMobile ? '10px 6px' : '12px', 
                    background: '#fafafa', 
                    borderRadius: '8px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                      CO₂
                    </Text>
                    <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: '#722ed1' }}>
                      {sensor.co2.toFixed(0)}
                    </div>
                    <Text type="secondary" style={{ fontSize: 10 }}>ppm</Text>
                  </div>
                </Col>
                <Col xs={8} sm={8}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: isMobile ? '10px 6px' : '12px', 
                    background: '#fafafa', 
                    borderRadius: '8px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                      Temp
                    </Text>
                    <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: '#ff7a45' }}>
                      {sensor.temperature.toFixed(1)}
                    </div>
                    <Text type="secondary" style={{ fontSize: 10 }}>°C</Text>
                  </div>
                </Col>
                <Col xs={8} sm={8}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: isMobile ? '10px 6px' : '12px', 
                    background: '#fafafa', 
                    borderRadius: '8px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                      Humidity
                    </Text>
                    <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: '#13c2c2' }}>
                      {sensor.humidity.toFixed(1)}
                    </div>
                    <Text type="secondary" style={{ fontSize: 10 }}>%</Text>
                  </div>
                </Col>
                <Col xs={8} sm={8}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: isMobile ? '10px 6px' : '12px', 
                    background: '#fafafa', 
                    borderRadius: '8px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                      TVOC
                    </Text>
                    <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: '#fa8c16' }}>
                      {sensor.tvoc.toFixed(0)}
                    </div>
                    <Text type="secondary" style={{ fontSize: 10 }}>index</Text>
                  </div>
                </Col>
              </Row>
            </Card>
          )}
        </Space>
      </div>
    </Modal>
  );
};
