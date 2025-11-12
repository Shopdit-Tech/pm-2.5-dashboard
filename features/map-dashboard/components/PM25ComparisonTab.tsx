'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Tag, Spin, Alert, Typography, Space } from 'antd';
import { TrophyOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useSensorData } from '../hooks/useSensorData';
import { getSensorHistory } from '@/services/sensorApi';
import { useThreshold } from '@/contexts/ThresholdContext';

const { Title, Text } = Typography;

type PM25ComparisonData = {
  id: string;
  rank: number;
  name: string;
  code: string;
  avgPm25: number;
  status: 'online' | 'offline';
};

export const PM25ComparisonTab = () => {
  const { sensors, error: sensorsError } = useSensorData(60000);
  const { getColorForValue } = useThreshold();
  const [comparisonData, setComparisonData] = useState<PM25ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparisons = async () => {
      if (sensors.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const comparisons: PM25ComparisonData[] = [];

        // Fetch 24h average for each sensor
        for (const sensor of sensors) {
          if (sensor.status === 'offline' || !sensor.code) {
            comparisons.push({
              id: sensor.id,
              rank: 0,
              name: sensor.name,
              code: sensor.code || sensor.id,
              avgPm25: 0,
              status: 'offline',
            });
            continue;
          }

          try {
            const historyResponse = await getSensorHistory({
              sensor_code: sensor.code,
              metric: 'pm25',
              since_hours: 24,
              agg_minutes: 60, // 1 hour aggregation for smoother average
            });

            // Calculate average PM2.5 from metrics
            const pm25Metric = historyResponse.metrics.find((m) => m.metric === 'pm25');
            const pm25Values = pm25Metric?.points
              .map((p) => p.value)
              .filter((v) => v !== null && v !== undefined) as number[];

            const avgPm25 =
              pm25Values.length > 0
                ? pm25Values.reduce((sum, val) => sum + val, 0) / pm25Values.length
                : sensor.pm25; // Fallback to current value

            comparisons.push({
              id: sensor.id,
              rank: 0,
              name: sensor.name,
              code: sensor.code,
              avgPm25,
              status: 'online',
            });
          } catch (err) {
            console.error(`Error fetching history for ${sensor.code}:`, err);
            // Use current value as fallback
            comparisons.push({
              id: sensor.id,
              rank: 0,
              name: sensor.name,
              code: sensor.code,
              avgPm25: sensor.pm25,
              status: 'online',
            });
          }
        }

        // Sort by PM2.5 (descending - worst first)
        comparisons.sort((a, b) => {
          if (a.status === 'offline' && b.status === 'online') return 1;
          if (a.status === 'online' && b.status === 'offline') return -1;
          return b.avgPm25 - a.avgPm25;
        });

        // Add rank
        comparisons.forEach((item, index) => {
          item.rank = index + 1;
        });

        setComparisonData(comparisons);
      } catch (err) {
        console.error('Error fetching comparison data:', err);
        setError('ไม่สามารถโหลดข้อมูลเปรียบเทียบได้');
      } finally {
        setLoading(false);
      }
    };

    fetchComparisons();
  }, [sensors]);

  const columns: ColumnsType<PM25ComparisonData> = [
    {
      title: 'อันดับ',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (rank: number) => {
        if (rank === 1) {
          return (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#fff1f0',
              border: '2px solid #f5222d',
              fontSize: 18,
              fontWeight: 700,
              color: '#f5222d'
            }}>
              {rank}
            </div>
          );
        }
        if (rank === 2) {
          return (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#fff7e6',
              border: '2px solid #fa8c16',
              fontSize: 16,
              fontWeight: 700,
              color: '#fa8c16'
            }}>
              {rank}
            </div>
          );
        }
        if (rank === 3) {
          return (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: '50%',
              backgroundColor: '#fffbe6',
              border: '2px solid #faad14',
              fontSize: 15,
              fontWeight: 700,
              color: '#faad14'
            }}>
              {rank}
            </div>
          );
        }
        return <Text strong>{rank}</Text>;
      },
    },
    {
      title: 'ชื่อเซ็นเซอร์',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#1890ff' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'PM2.5 เฉลี่ย 24 ชม.',
      dataIndex: 'avgPm25',
      key: 'avgPm25',
      width: 180,
      align: 'center',
      sorter: (a, b) => a.avgPm25 - b.avgPm25,
      render: (avgPm25: number, record: PM25ComparisonData) => {
        if (record.status === 'offline') {
          return <Text type="secondary">ออฟไลน์</Text>;
        }

        const color = getColorForValue('pm25', avgPm25);

        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 8,
                height: 32,
                backgroundColor: color,
                borderRadius: 4,
              }}
            />
            <Text strong style={{ fontSize: 18 }}>
              {avgPm25.toFixed(1)}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              µg/m³
            </Text>
          </div>
        );
      },
    },
    {
      title: 'คุณภาพอากาศ',
      key: 'quality',
      width: 150,
      align: 'center',
      render: (_: any, record: PM25ComparisonData) => {
        if (record.status === 'offline') {
          return <Tag color="default">ออฟไลน์</Tag>;
        }

        const { avgPm25 } = record;

        if (avgPm25 <= 15) {
          return <Tag color="blue">คุณภาพอากาศดีมาก</Tag>;
        }
        if (avgPm25 <= 25) {
          return <Tag color="success">คุณภาพอากาศดี</Tag>;
        }
        if (avgPm25 <= 37.5) {
          return <Tag color="warning">คุณภาพอากาศปานกลาง</Tag>;
        }
        if (avgPm25 <= 75) {
          return <Tag color="orange">เริ่มมีผลกระทบต่อสุขภาพ</Tag>;
        }
        return <Tag color="error">มีผลกระทบต่อสุขภาพ</Tag>;
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string) => (
        <Tag color={status === 'online' ? 'green' : 'red'}>
          {status === 'online' ? 'ออนไลน์' : 'ออฟไลน์'}
        </Tag>
      ),
    },
  ];

  if (sensorsError || error) {
    return (
      <Alert
        message="เกิดข้อผิดพลาด"
        description={error || 'ไม่สามารถโหลดข้อมูลเซ็นเซอร์ได้'}
        type="error"
        showIcon
        style={{ borderRadius: 12 }}
      />
    );
  }

  return (
    <div style={{ padding: '16px 0' }}>
      {/* Header */}
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          boxShadow: '0 4px 16px rgba(102,126,234,0.3)',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Title level={4} style={{ margin: 0, color: 'white' }}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          เปรียบเทียบค่า PM2.5 เฉลี่ย 24 ชั่วโมง
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
          แสดงค่าเฉลี่ย PM2.5 ย้อนหลัง 24 ชั่วโมง เรียงจากสูงสุดไปต่ำสุด
        </Text>
      </Card>

      {/* Comparison Table */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: 'none',
        }}
        bodyStyle={{ padding: 0 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#8c8c8c' }}>
              กำลังคำนวณค่าเฉลี่ย PM2.5...
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={comparisonData}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `ทั้งหมด ${total} เซ็นเซอร์`,
            }}
            rowClassName={(record) => {
              if (record.status === 'offline') return 'row-offline';
              if (record.rank === 1) return 'row-rank-1';
              if (record.rank === 2) return 'row-rank-2';
              if (record.rank === 3) return 'row-rank-3';
              return '';
            }}
          />
        )}

        <style jsx global>{`
          .row-offline {
            background-color: #f5f5f5 !important;
            opacity: 0.6;
          }
          .row-rank-1 {
            background-color: #fff1f0 !important;
          }
          .row-rank-2 {
            background-color: #fff7e6 !important;
          }
          .row-rank-3 {
            background-color: #fffbe6 !important;
          }
          .row-offline:hover td,
          .row-rank-1:hover td,
          .row-rank-2:hover td,
          .row-rank-3:hover td {
            background-color: inherit !important;
          }
        `}</style>
      </Card>
    </div>
  );
};
