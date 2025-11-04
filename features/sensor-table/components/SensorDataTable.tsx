'use client';

import { useState, useMemo, useEffect } from 'react';
import { Table, Card, Input, Button, Space, Checkbox, Dropdown, Tag, Typography, Badge, Spin, Alert } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import { SensorData } from '@/types/sensor';
import { getParameterColor } from '@/utils/airQualityUtils';
import { SensorDetailModal } from './SensorDetailModal';
import { ParameterHistoryModal } from './ParameterHistoryModal';
import { useSensorTableData } from '../hooks/useSensorTableData';

const { Text } = Typography;

type ColumnKey = 'temperature' | 'humidity' | 'co2' | 'pm25' | 'pm10' | 'tvoc';

export const SensorDataTable = () => {
  // Use real API data
  const { sensors, loading, error, refetch } = useSensorTableData(60000); // Auto-refresh every 60 seconds
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // History modal state
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState<{
    sensor: SensorData;
    parameter: string;
    value: number;
  } | null>(null);
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>([
    'temperature',
    'humidity',
    'co2',
    'pm25',
    'pm10',
    'tvoc',
  ]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Refresh data manually
  const refreshData = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filter sensors based on search query
  const filteredSensors = useMemo(() => {
    if (!searchQuery.trim()) return sensors;
    
    const query = searchQuery.toLowerCase();
    return sensors.filter((sensor) =>
      sensor.name.toLowerCase().includes(query) ||
      sensor.type.toLowerCase().includes(query) ||
      sensor.maker?.toLowerCase().includes(query)
    );
  }, [sensors, searchQuery]);

  // Handle parameter click to show history
  const handleParameterClick = (sensor: SensorData, parameter: string, value: number) => {
    setSelectedParameter({ sensor, parameter, value });
    setHistoryModalVisible(true);
  };

  // Handle close history modal
  const handleCloseHistoryModal = () => {
    setHistoryModalVisible(false);
    setSelectedParameter(null);
  };

  // Render color-coded parameter cell (clickable)
  const renderParameterCell = (value: number, parameter: string, sensor: SensorData) => {
    const color = getParameterColor(parameter as any, value);
    
    return (
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '6px',
          transition: 'background-color 0.2s',
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleParameterClick(sensor, parameter, value);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f5f5f5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="Click to view historical data"
      >
        <div
          style={{
            width: 6,
            height: 24,
            backgroundColor: color,
            borderRadius: 3,
          }}
        />
        <Text strong style={{ fontSize: 14 }}>
          {value.toFixed(1)}
        </Text>
      </div>
    );
  };

  // Table columns
  const columns: ColumnsType<SensorData> = [
    {
      title: 'ชื่อ',
      dataIndex: 'name',
      key: 'name',
      fixed: isMobile ? false : 'left',
      width: isMobile ? 180 : 250,
      render: (name: string, record: SensorData) => (
        <div>
          <Text strong style={{ fontSize: isMobile ? 12 : 13, wordBreak: 'break-word' }}>
            {name}
          </Text>
          {record.status === 'offline' && (
            <Tag color="red" style={{ marginLeft: 8, fontSize: 11 }}>
              offline
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      align: 'center',
      responsive: ['md'] as Breakpoint[],
      render: (type: string) => (
        type === 'outdoor' ? (
          <CheckOutlined style={{ color: '#52c41a', fontSize: 16 }} />
        ) : (
          <CloseOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />
        )
      ),
    },
    ...(visibleColumns.includes('pm25')
      ? [
          {
            title: 'PM₂.₅ (μg/m³)',
            dataIndex: 'pm25',
            key: 'pm25',
            width: 140,
            render: (value: number, record: SensorData) =>
              record.status === 'online' ? renderParameterCell(value, 'pm25', record) : <Text type="secondary">-</Text>,
          },
        ]
      : []),
    ...(visibleColumns.includes('co2')
      ? [
          {
            title: 'CO₂ (ppm)',
            dataIndex: 'co2',
            key: 'co2',
            width: 140,
            responsive: ['lg'] as Breakpoint[],
            render: (value: number, record: SensorData) =>
              record.status === 'online' ? renderParameterCell(value, 'co2', record) : <Text type="secondary">-</Text>,
          },
        ]
      : []),
    ...(visibleColumns.includes('temperature')
      ? [
          {
            title: 'Temp. (°C)',
            dataIndex: 'temperature',
            key: 'temperature',
            width: 130,
            responsive: ['lg'] as Breakpoint[],
            render: (value: number, record: SensorData) =>
              record.status === 'online' ? renderParameterCell(value, 'temperature', record) : <Text type="secondary">-</Text>,
          },
        ]
      : []),
    ...(visibleColumns.includes('humidity')
      ? [
          {
            title: 'R.Hum. (%)',
            dataIndex: 'humidity',
            key: 'humidity',
            width: 130,
            responsive: ['lg'] as Breakpoint[],
            render: (value: number, record: SensorData) =>
              record.status === 'online' ? renderParameterCell(value, 'humidity', record) : <Text type="secondary">-</Text>,
          },
        ]
      : []),
    ...(visibleColumns.includes('pm10')
      ? [
          {
            title: 'PM₁₀ (μg/m³)',
            dataIndex: 'pm10',
            key: 'pm10',
            width: 140,
            responsive: ['lg'] as Breakpoint[],
            render: (value: number, record: SensorData) =>
              record.status === 'online' ? renderParameterCell(value, 'pm10', record) : <Text type="secondary">-</Text>,
          },
        ]
      : []),
    ...(visibleColumns.includes('tvoc')
      ? [
          {
            title: 'TVOC (index)',
            dataIndex: 'tvoc',
            key: 'tvoc',
            width: 140,
            responsive: ['lg'] as Breakpoint[],
            render: (value: number, record: SensorData) =>
              record.status === 'online' ? renderParameterCell(value, 'tvoc', record) : <Text type="secondary">-</Text>,
          },
        ]
      : []),
    {
      title: 'อัปเดตล่าสุด',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      responsive: ['md'] as Breakpoint[],
      render: (timestamp: string, record: SensorData) => {
        if (record.status === 'offline') {
          return <Text type="secondary">ออฟไลน์</Text>;
        }
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
        
        let timeAgo = '';
        if (diffMinutes < 1) timeAgo = 'Just now';
        else if (diffMinutes === 1) timeAgo = '1 min ago';
        else if (diffMinutes < 60) timeAgo = `${diffMinutes} mins ago`;
        else timeAgo = date.toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit' });
        
        return (
          <div>
            <Text style={{ fontSize: 13 }}>{date.toLocaleDateString('th-TH')}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {timeAgo}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'ดำเนินการ',
      key: 'action',
      fixed: isMobile ? false : 'right',
      width: isMobile ? 60 : 80,
      align: 'center',
      render: (_: any, record: SensorData) => (
        <Button
          type="text"
          icon={<MoreOutlined />}
          onClick={() => handleViewDetails(record)}
          size={isMobile ? 'small' : 'middle'}
          style={{ padding: isMobile ? '2px 4px' : '4px 8px' }}
        />
      ),
    },
  ];

  // Handle view details
  const handleViewDetails = (sensor: SensorData) => {
    setSelectedSensor(sensor);
    setIsModalVisible(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedSensor(null);
  };

  // Column filter menu
  const columnFilterMenu = (
    <Card style={{ width: 200 }} bodyStyle={{ padding: 12 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text strong style={{ fontSize: 13 }}>
          แสดงคอลัมน์
        </Text>
        <Checkbox.Group
          value={visibleColumns}
          onChange={(values) => setVisibleColumns(values as ColumnKey[])}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Checkbox value="pm25">PM₂.₅</Checkbox>
            <Checkbox value="co2">CO₂</Checkbox>
            <Checkbox value="temperature">Temperature</Checkbox>
            <Checkbox value="humidity">Humidity</Checkbox>
            <Checkbox value="pm10">PM₁₀</Checkbox>
            <Checkbox value="tvoc">TVOC</Checkbox>
          </Space>
        </Checkbox.Group>
      </Space>
    </Card>
  );

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', background: '#f5f7fa', minHeight: '100%' }}>
      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Sensors"
          description="Unable to load sensor data. Please try refreshing the page."
          type="error"
          closable
          showIcon
          style={{ marginBottom: 16, borderRadius: 12 }}
        />
      )}

      {/* Loading State */}
      {loading && sensors.length === 0 && (
        <Card style={{ borderRadius: 16, textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#8c8c8c' }}>
            Loading sensor data...
          </div>
        </Card>
      )}

      {/* Main Content */}
      {!loading || sensors.length > 0 ? (
        <>
          {/* Header */}
          <Card
        className="mb-6"
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <Typography.Title level={5} style={{ margin: 0, fontSize: isMobile ? 16 : 18 }}>
              ตารางข้อมูลเซ็นเซอร์
            </Typography.Title>
            <Text type="secondary" style={{ fontSize: isMobile ? 12 : 13 }}>
              ข้อมูลเรียลไทม์จาก {filteredSensors.length} เซ็นเซอร์
            </Text>
          </div>

          <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: isMobile ? '100%' : 'auto' }}>
            <Input
              placeholder="ค้นหาเซ็นเซอร์..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: isMobile ? '100%' : 250 }}
              size={isMobile ? 'middle' : 'large'}
              allowClear
            />
            
            <Space style={{ width: isMobile ? '100%' : 'auto' }}>
              <Dropdown overlay={columnFilterMenu} trigger={['click']} placement="bottomRight">
                <Button icon={<SettingOutlined />} size={isMobile ? 'middle' : 'large'} style={{ flex: isMobile ? 1 : 'none' }}>
                  {!isMobile && 'คอลัมน์'}
                </Button>
              </Dropdown>

              <Button
                icon={<ReloadOutlined spin={isRefreshing} />}
                onClick={refreshData}
                loading={isRefreshing}
                size={isMobile ? 'middle' : 'large'}
                style={{ flex: isMobile ? 1 : 'none' }}
              >
                {!isMobile && 'รีเฟรช'}
              </Button>
            </Space>
          </Space>
        </div>

        {/* Stats */}
        {!isMobile && (
          <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
            <div>
              <Badge status="success" />
              <Text type="secondary" style={{ fontSize: 13 }}>
                ออนไลน์: {sensors.filter((s) => s.status === 'online').length}
              </Text>
            </div>
            <div>
              <Badge status="error" />
              <Text type="secondary" style={{ fontSize: 13 }}>
                ออฟไลน์: {sensors.filter((s) => s.status === 'offline').length}
              </Text>
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: 'none',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns as any}
          dataSource={filteredSensors}
          rowKey="id"
          scroll={{ x: isMobile ? 600 : 1400 }}
          pagination={{
            pageSize: isMobile ? 10 : 20,
            showSizeChanger: !isMobile,
            showTotal: isMobile ? undefined : (total) => `Total ${total} sensors`,
            size: isMobile ? 'small' : 'default',
          }}
          onRow={(record) => ({
            onClick: () => handleViewDetails(record),
            style: { cursor: 'pointer' },
          })}
          rowClassName={(record) =>
            record.status === 'offline' ? 'row-offline' : ''
          }
        />

        <style jsx global>{`
          .row-offline {
            background-color: #fff1f0 !important;
          }
          .row-offline:hover td {
            background-color: #ffe7e6 !important;
          }
        `}</style>
      </Card>

      {/* Sensor Detail Modal */}
      {selectedSensor && (
        <SensorDetailModal
          sensor={selectedSensor}
          visible={isModalVisible}
          onClose={handleCloseModal}
        />
      )}

      {/* Parameter History Modal */}
      {selectedParameter && (
        <ParameterHistoryModal
          sensor={selectedParameter.sensor}
          parameter={selectedParameter.parameter}
          currentValue={selectedParameter.value}
          visible={historyModalVisible}
          onClose={handleCloseHistoryModal}
        />
      )}
        </>
      ) : null}
    </div>
  );
};
