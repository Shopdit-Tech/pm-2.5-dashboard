'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, message, Tag, Modal, Form, InputNumber } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { SENSOR_TABLE_DATA } from '@/features/sensor-table/services/sensorTableData';
import { MOBILE_SENSOR_DATA } from '@/features/mobile-sensor-table/services/mobileSensorData';
import type { SensorData } from '@/types/sensor';

const { Option } = Select;

const STORAGE_KEY = 'sensor_config';
const CUSTOM_SENSORS_KEY = 'sensor_config_custom';
const BASE_SENSORS = [...SENSOR_TABLE_DATA, ...MOBILE_SENSOR_DATA];
const BASE_SENSOR_IDS = new Set(BASE_SENSORS.map((sensor) => sensor.id));

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
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

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
    if (typeof window === 'undefined') {
      setSensors(BASE_SENSORS.map((sensor) => ({ ...sensor })));
      return;
    }

    const baseSensors = BASE_SENSORS.map((sensor) => ({ ...sensor }));

    let configuredBaseSensors = baseSensors;
    const savedConfigs = localStorage.getItem(STORAGE_KEY);
    if (savedConfigs) {
      try {
        const configs: SensorConfig[] = JSON.parse(savedConfigs);
        configuredBaseSensors = baseSensors.map((sensor) => {
          const config = configs.find((c) => c.id === sensor.id);
          return config ? { ...sensor, name: config.name, type: config.type as any } : sensor;
        });
      } catch (error) {
        console.error('Failed to load sensor config:', error);
        configuredBaseSensors = baseSensors;
      }
    }

    let customSensors: SensorData[] = [];
    const savedCustom = localStorage.getItem(CUSTOM_SENSORS_KEY);
    if (savedCustom) {
      try {
        const parsed: SensorData[] = JSON.parse(savedCustom);
        customSensors = parsed.map((sensor) => ({
          ...sensor,
          timestamp: sensor.timestamp || new Date().toISOString(),
        }));
      } catch (error) {
        console.error('Failed to load custom sensors:', error);
      }
    }

    setSensors([...configuredBaseSensors, ...customSensors]);
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
    const baseConfigs: SensorConfig[] = updatedSensors
      .filter((s) => BASE_SENSOR_IDS.has(s.id))
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
      }));

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(baseConfigs));
      const customSensors = updatedSensors.filter((s) => !BASE_SENSOR_IDS.has(s.id));
      localStorage.setItem(CUSTOM_SENSORS_KEY, JSON.stringify(customSensors));
    }

    message.success('บันทึกการตั้งค่าเซ็นเซอร์แล้ว');
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ name: '', type: '' });
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CUSTOM_SENSORS_KEY);
    loadSensors();
    message.success('รีเซ็ตการตั้งค่าเซ็นเซอร์แล้ว');
  };

  const handleOpenCreateModal = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      type: 'outdoor',
      status: 'online',
      latitude: 0,
      longitude: 0,
    });
    setCreateModalVisible(true);
  };

  const handleCreateCancel = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
  };

  const handleCreateSensor = async () => {
    try {
      const values = await createForm.validateFields();

      if (sensors.some((sensor) => sensor.id === values.id)) {
        message.error('รหัสเซ็นเซอร์นี้ถูกใช้งานแล้ว');
        return;
      }

      const newSensor: SensorData = {
        id: values.id,
        code: values.code || undefined,
        name: values.name,
        type: values.type,
        status: values.status,
        latitude: values.latitude ?? 0,
        longitude: values.longitude ?? 0,
        temperature: 0,
        humidity: 0,
        co2: 0,
        pm1: 0,
        pm25: 0,
        pm10: 0,
        tvoc: 0,
        timestamp: new Date().toISOString(),
      };

      const updatedSensors = [...sensors, newSensor];
      setSensors(updatedSensors);

      if (typeof window !== 'undefined') {
        const customSensors = updatedSensors.filter((sensor) => !BASE_SENSOR_IDS.has(sensor.id));
        localStorage.setItem(CUSTOM_SENSORS_KEY, JSON.stringify(customSensors));

        const baseConfigs: SensorConfig[] = updatedSensors
          .filter((sensor) => BASE_SENSOR_IDS.has(sensor.id))
          .map((sensor) => ({
            id: sensor.id,
            name: sensor.name,
            type: sensor.type,
          }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(baseConfigs));
      }

      message.success('สร้างเซ็นเซอร์ใหม่สำเร็จ');
      handleCreateCancel();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error('ไม่สามารถสร้างเซ็นเซอร์ใหม่');
    }
  };

  const columns = [
    {
      title: 'รหัสเซ็นเซอร์',
      dataIndex: 'id',
      key: 'id',
      width: isMobile ? 120 : 200,
      render: (text: string) => <span style={{ fontFamily: 'monospace', color: '#8c8c8c', fontSize: isMobile ? 11 : 13 }}>{text}</span>,
    },
    {
      title: 'ชื่อ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: SensorData) => {
        if (editingId === record.id) {
          return (
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="ชื่อเซ็นเซอร์"
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
      title: 'ประเภท',
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
              <Option value="indoor">ภายใน</Option>
              <Option value="outdoor">ภายนอก</Option>
              <Option value="mobile">เคลื่อนที่</Option>
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
      title: 'สถานะ',
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
      title: 'ดำเนินการ',
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
                บันทึก
              </Button>
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={handleCancel}
              >
                ยกเลิก
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
            แก้ไข
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? 12 : 0 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: isMobile ? 16 : 18 }}>การตั้งค่าเซ็นเซอร์</h3>
          <p style={{ margin: 0, color: '#8c8c8c', fontSize: isMobile ? 12 : 14 }}>
            {isMobile ? `${sensors.length} เซ็นเซอร์` : `ตั้งค่าชื่อและประเภทของเซ็นเซอร์ (${sensors.length} เซ็นเซอร์ทั้งหมด)`}
          </p>
        </div>
        <Space
          direction={isMobile ? 'vertical' : 'horizontal'}
          size={isMobile ? 8 : 12}
          style={{ width: isMobile ? '100%' : 'auto' }}
        >
          <Button
            type="primary"
            onClick={handleOpenCreateModal}
            size={isMobile ? 'middle' : 'large'}
            block={isMobile}
          >
            {isMobile ? 'เพิ่มเซ็นเซอร์' : 'เพิ่มเซ็นเซอร์ใหม่'}
          </Button>
          <Button
            onClick={handleReset}
            danger
            size={isMobile ? 'middle' : 'large'}
            block={isMobile}
          >
            {isMobile ? 'รีเซ็ต' : 'รีเซ็ตเป็นค่าเริ่มต้น'}
          </Button>
        </Space>
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
        <strong>หมายเหตุ:</strong> การเปลี่ยนแปลงจะถูกบันทึกใน localStorage ของเบราว์เซอร์
        คลิก "รีเซ็ตเป็นค่าเริ่มต้น" เพื่อคืนค่าเซ็นเซอร์เดิม
      </div>

      <Modal
        open={createModalVisible}
        title="เพิ่มเซ็นเซอร์ใหม่"
        onCancel={handleCreateCancel}
        onOk={handleCreateSensor}
        okText="สร้าง"
        cancelText="ยกเลิก"
        destroyOnClose
        width={isMobile ? '95%' : 520}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="id"
            label="รหัสเซ็นเซอร์"
            rules={[{ required: true, message: 'กรุณากรอกรหัสเซ็นเซอร์' }]}
          >
            <Input placeholder="เช่น airgradient:123456" />
          </Form.Item>
          <Form.Item name="code" label="Sensor Code">
            <Input placeholder="รหัสสำหรับ API (ถ้ามี)" />
          </Form.Item>
          <Form.Item
            name="name"
            label="ชื่อเซ็นเซอร์"
            rules={[{ required: true, message: 'กรุณากรอกชื่อเซ็นเซอร์' }]}
          >
            <Input placeholder="ชื่อที่ต้องการแสดง" />
          </Form.Item>
          <Form.Item
            name="type"
            label="ประเภท"
            rules={[{ required: true, message: 'กรุณาเลือกประเภทเซ็นเซอร์' }]}
          >
            <Select placeholder="เลือกประเภท">
              <Option value="indoor">ภายใน</Option>
              <Option value="outdoor">ภายนอก</Option>
              <Option value="mobile">เคลื่อนที่</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="สถานะ"
            rules={[{ required: true, message: 'กรุณาเลือกสถานะ' }]}
          >
            <Select placeholder="เลือกสถานะ">
              <Option value="online">ออนไลน์</Option>
              <Option value="offline">ออฟไลน์</Option>
            </Select>
          </Form.Item>
          <Space size={16} style={{ width: '100%' }} direction={isMobile ? 'vertical' : 'horizontal'}>
            <Form.Item name="latitude" label="ละติจูด" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} placeholder="เช่น 13.7563" />
            </Form.Item>
            <Form.Item name="longitude" label="ลองจิจูด" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} placeholder="เช่น 100.5018" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};
