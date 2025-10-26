'use client';

import { Card, Typography, Spin, Alert, Space } from 'antd';
import { DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { SensorData } from '@/types/sensor';
import { ExportForm } from './ExportForm';

const { Title, Text, Paragraph } = Typography;

type DataExportPageProps = {
  sensors: SensorData[];
  loading?: boolean;
  error?: string | null;
};

export const DataExportPage = ({ sensors, loading, error }: DataExportPageProps) => {
  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <DownloadOutlined />
          BMA | Data Export
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          Export historical sensor data as CSV format
        </Text>
      </div>

      {/* Main Content */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
        styles={{ body: { padding: 32 } }}
      >
        <Title level={3} style={{ marginTop: 0 }}>
          Export Data as CSV
        </Title>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#8c8c8c' }}>
              Loading sensors...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert
            type="error"
            message="Error Loading Sensors"
            description={error}
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Export Form */}
        {!loading && !error && sensors.length > 0 && (
          <ExportForm sensors={sensors} />
        )}

        {/* No Sensors */}
        {!loading && !error && sensors.length === 0 && (
          <Alert
            type="warning"
            message="No Sensors Available"
            description="There are no sensors available for export. Please check your sensor configuration."
            showIcon
          />
        )}
      </Card>

      {/* Additional Information */}
      <Card
        style={{
          marginTop: 24,
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Title level={4}>CSV Format Information</Title>
        <Paragraph>
          The exported CSV file will contain the following columns:
        </Paragraph>
        <ul style={{ columns: 2, columnGap: 40 }}>
          <li>Location ID & Name</li>
          <li>Sensor ID & Type</li>
          <li>Local & UTC Date/Time</li>
          <li>PM2.5, PM1, PM10 (μg/m³)</li>
          <li>CO2 (ppm)</li>
          <li>Temperature (°C)</li>
          <li>Heat Index (°C)</li>
          <li>Humidity (%)</li>
          <li>TVOC (ppb)</li>
          <li>Particle Count (0.3μm)</li>
        </ul>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Fields not available from the sensor will be marked with "-" in the CSV file.
        </Paragraph>
      </Card>
    </div>
  );
};
