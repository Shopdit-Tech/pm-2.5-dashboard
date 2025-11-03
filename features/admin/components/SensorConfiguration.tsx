'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, message, Tag } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { SENSOR_TABLE_DATA } from '@/features/sensor-table/services/sensorTableData';
import { MOBILE_SENSOR_DATA } from '@/features/mobile-sensor-table/services/mobileSensorData';
import type { SensorData } from '@/types/sensor';

const { Option } = Select;

const STORAGE_KEY = 'sensor_config';

type SensorConfig = {
  id: string;
  name: string;
  type: string;
};

export const SensorConfiguration = () => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; type: string }>({ name: '', type: '' });
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

  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = () => {
    // Load all sensors
    const allSensors = [...SENSOR_TABLE_DATA, ...MOBILE_SENSOR_DATA];
    
    // Load custom configurations from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const configs: SensorConfig[] = JSON.parse(saved);
        const updatedSensors = allSensors.map((sensor) => {
          const config = configs.find((c) => c.id === sensor.id);
          return config ? { ...sensor, name: config.name, type: config.type as any } : sensor;
        });
        setSensors(updatedSensors);
      } catch (error) {
        console.error('Failed to load sensor config:', error);
        setSensors(allSensors);
      }
    } else {
      setSensors(allSensors);
    }
  };

  const handleEdit = (sensor: SensorData) => {
    setEditingId(sensor.id);
    setEditForm({ name: sensor.name, type: sensor.type });
  };

  const handleSave = (sensorId: string) => {
    // Update sensor in state
    const updatedSensors = sensors.map((s) =>
      s.id === sensorId ? { ...s, name: editForm.name, type: editForm.type as any } : s
    );
    setSensors(updatedSensors);

    // Save to localStorage
    const configs: SensorConfig[] = updatedSensors.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));

    message.success('Sensor configuration saved');
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ name: '', type: '' });
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    loadSensors();
    message.success('Sensor configurations reset to defaults');
  };

  const columns = [
    {
      title: 'Sensor ID',
      dataIndex: 'id',
      key: 'id',
      width: isMobile ? 120 : 200,
      render: (text: string) => <span style={{ fontFamily: 'monospace', color: '#8c8c8c', fontSize: isMobile ? 11 : 13 }}>{text}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: SensorData) => {
        if (editingId === record.id) {
          return (
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Sensor name"
              autoFocus
            />
          );
        }
        return (
          <Space>
            <EnvironmentOutlined />
            <span style={{ fontWeight: 500 }}>{text}</span>
          </Space>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 180,
      render: (type: string, record: SensorData) => {
        if (editingId === record.id) {
          return (
            <Select
              value={editForm.type}
              onChange={(value) => setEditForm({ ...editForm, type: value })}
              style={{ width: '100%' }}
            >
              <Option value="indoor">Indoor</Option>
              <Option value="outdoor">Outdoor</Option>
              <Option value="mobile">Mobile</Option>
            </Select>
          );
        }
        return (
          <Tag color={type === 'indoor' ? 'blue' : type === 'outdoor' ? 'green' : 'orange'}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      responsive: isMobile ? ['md' as const] : undefined,
      render: (status: string) => (
        <Tag color={status === 'online' ? 'success' : 'error'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: SensorData) => {
        if (editingId === record.id) {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                onClick={() => handleSave(record.id)}
              >
                Save
              </Button>
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Space>
          );
        }
        return (
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? 12 : 0 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: isMobile ? 16 : 18 }}>Sensor Configuration</h3>
          <p style={{ margin: 0, color: '#8c8c8c', fontSize: isMobile ? 12 : 14 }}>
            {isMobile ? `${sensors.length} sensors` : `Configure sensor names and types (${sensors.length} total sensors)`}
          </p>
        </div>
        <Button
          onClick={handleReset}
          danger
          size={isMobile ? 'middle' : 'large'}
          block={isMobile}
        >
          {isMobile ? 'Reset' : 'Reset to Defaults'}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={sensors}
        rowKey="id"
        pagination={{ pageSize: isMobile ? 10 : 15, size: isMobile ? 'small' : 'default' }}
        scroll={{ x: isMobile ? 600 : 800 }}
        size={isMobile ? 'small' : 'middle'}
      />

      <div style={{ marginTop: 16, padding: isMobile ? 10 : 12, background: '#f5f5f5', borderRadius: 8, fontSize: isMobile ? 12 : 14 }}>
        <strong>Note:</strong> Changes are saved to browser localStorage and will persist across sessions.
        Click "Reset to Defaults" to restore original sensor configurations.
      </div>
    </div>
  );
};
