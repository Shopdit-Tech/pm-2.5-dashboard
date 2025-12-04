'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, message, Tag, Modal, Form, InputNumber, Spin, Popconfirm } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, EnvironmentOutlined, DeleteOutlined } from '@ant-design/icons';
import { sensorService } from '../services/sensorService';
import type { AdminSensor, SensorType } from '../types/sensor';

const { Option } = Select;

export const SensorConfiguration = () => {
  const [sensors, setSensors] = useState<AdminSensor[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ 
    name: string; 
    code: string; 
    type: SensorType;
    fixed_lat: number | null;
    fixed_lng: number | null;
  }>({ 
    name: '', 
    code: '',
    type: 'INDOOR',
    fixed_lat: null,
    fixed_lng: null,
  });
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

  const loadSensors = async () => {
    setLoading(true);
    try {
      const data = await sensorService.getSensors();
      setSensors(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load sensors');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sensor: AdminSensor) => {
    setEditingId(sensor.id);
    setEditForm({ 
      name: sensor.name || '', 
      code: sensor.code, 
      type: sensor.type,
      fixed_lat: sensor.fixed_lat,
      fixed_lng: sensor.fixed_lng,
    });
  };

  const handleSave = async (sensorId: string) => {
    try {
      const sensor = sensors.find((s) => s.id === sensorId);
      if (!sensor) return;

      await sensorService.updateSensor({
        code: sensor.code,
        name: editForm.name,
        type: editForm.type,
        // Only send lat/lng for non-mobile sensors
        fixed_lat: editForm.type === 'MOBILE' ? undefined : (editForm.fixed_lat ?? undefined),
        fixed_lng: editForm.type === 'MOBILE' ? undefined : (editForm.fixed_lng ?? undefined),
      });

      message.success('บันทึกการตั้งค่าเซ็นเซอร์แล้ว');
      setEditingId(null);
      await loadSensors();
    } catch (error: any) {
      message.error(error.message || 'Failed to update sensor');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ name: '', code: '', type: 'INDOOR', fixed_lat: null, fixed_lng: null });
  };

  const handleDelete = async (sensorId: string, sensorName: string) => {
    try {
      await sensorService.deleteSensor(sensorId);
      message.success(`ลบเซ็นเซอร์ "${sensorName}" แล้ว`);
      await loadSensors();
    } catch (error: any) {
      message.error(error.message || 'Failed to delete sensor');
    }
  };

  const handleOpenCreateModal = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      type: 'fixed',
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

      // Map simple type to sensor configuration
      const isMobile = values.type === 'mobile';
      const sensorType = isMobile ? 'MOBILE' : 'OUTDOOR';

      await sensorService.createSensor({
        code: values.code,
        name: values.name,
        type: sensorType as SensorType,
        is_movable: isMobile,
        // Only send lat/lng for fixed sensors
        fixed_lat: isMobile ? undefined : values.latitude,
        fixed_lng: isMobile ? undefined : values.longitude,
        address: values.address,
      });

      message.success('สร้างเซ็นเซอร์ใหม่สำเร็จ');
      handleCreateCancel();
      await loadSensors();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error(error.message || 'ไม่สามารถสร้างเซ็นเซอร์ใหม่');
    }
  };

  const columns = [
    {
      title: 'รหัสเซ็นเซอร์',
      dataIndex: 'code',
      key: 'code',
      width: isMobile ? 120 : 200,
      render: (text: string) => <span style={{ fontFamily: 'monospace', color: '#8c8c8c', fontSize: isMobile ? 11 : 13 }}>{text}</span>,
    },
    {
      title: 'ชื่อ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string | null, record: AdminSensor) => {
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
            <span style={{ fontWeight: 500 }}>{text || record.code}</span>
          </Space>
        );
      },
    },
    {
      title: 'ประเภท',
      dataIndex: 'is_movable',
      key: 'is_movable',
      width: 180,
      render: (isMovable: boolean, record: AdminSensor) => {
        if (editingId === record.id) {
          return (
            <Select
              value={editForm.type}
              onChange={(value) => {
                // Clear lat/lng when switching to MOBILE
                if (value === 'MOBILE') {
                  setEditForm({ ...editForm, type: value, fixed_lat: null, fixed_lng: null });
                } else {
                  setEditForm({ ...editForm, type: value });
                }
              }}
              style={{ width: '100%' }}
              className="font-noto-sans-thai"
              getPopupContainer={(trigger) => trigger.parentElement}
            >
              <Option value="INDOOR">ภายใน</Option>
              <Option value="OUTDOOR">ภายนอก</Option>
              <Option value="MOBILE">เคลื่อนที่</Option>
            </Select>
          );
        }
        
        // Simple display: Fixed vs Mobile
        return (
          <Tag color={isMovable ? 'orange' : 'blue'}>
            {isMovable ? 'เคลื่อนที่' : 'ติดตั้ง'}
          </Tag>
        );
      },
    },
    {
      title: 'ละติจูด',
      dataIndex: 'fixed_lat',
      key: 'fixed_lat',
      width: 150,
      responsive: isMobile ? ['lg' as const] : undefined,
      render: (lat: number | null, record: AdminSensor) => {
        // Mobile sensors don't have fixed location
        if (record.is_movable) {
          return <span style={{ fontSize: 12, color: '#bfbfbf', fontStyle: 'italic' }}>ไม่ระบุ</span>;
        }
        if (editingId === record.id) {
          // Don't show input if type is MOBILE
          if (editForm.type === 'MOBILE') {
            return <span style={{ fontSize: 12, color: '#bfbfbf', fontStyle: 'italic' }}>ไม่ระบุ</span>;
          }
          return (
            <InputNumber
              value={editForm.fixed_lat}
              onChange={(value) => setEditForm({ ...editForm, fixed_lat: value })}
              style={{ width: '100%' }}
              placeholder="ละติจูด"
              step={0.0001}
              size="small"
            />
          );
        }
        return <span style={{ fontSize: 12, color: '#8c8c8c' }}>{lat?.toFixed(4) || '-'}</span>;
      },
    },
    {
      title: 'ลองจิจูด',
      dataIndex: 'fixed_lng',
      key: 'fixed_lng',
      width: 150,
      responsive: isMobile ? ['lg' as const] : undefined,
      render: (lng: number | null, record: AdminSensor) => {
        // Mobile sensors don't have fixed location
        if (record.is_movable) {
          return <span style={{ fontSize: 12, color: '#bfbfbf', fontStyle: 'italic' }}>ไม่ระบุ</span>;
        }
        if (editingId === record.id) {
          // Don't show input if type is MOBILE
          if (editForm.type === 'MOBILE') {
            return <span style={{ fontSize: 12, color: '#bfbfbf', fontStyle: 'italic' }}>ไม่ระบุ</span>;
          }
          return (
            <InputNumber
              value={editForm.fixed_lng}
              onChange={(value) => setEditForm({ ...editForm, fixed_lng: value })}
              style={{ width: '100%' }}
              placeholder="ลองจิจูด"
              step={0.0001}
              size="small"
            />
          );
        }
        return <span style={{ fontSize: 12, color: '#8c8c8c' }}>{lng?.toFixed(4) || '-'}</span>;
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'is_online',
      key: 'is_online',
      width: 100,
      responsive: isMobile ? ['md' as const] : undefined,
      render: (isOnline: boolean) => (
        <Tag color={isOnline ? 'success' : 'error'}>
          {isOnline ? 'Online' : 'Offline'}
        </Tag>
      ),
    },
    {
      title: 'ดำเนินการ',
      key: 'actions',
      width: 180,
      render: (_: any, record: AdminSensor) => {
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
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              แก้ไข
            </Button>
            <Popconfirm
              title="ลบเซ็นเซอร์"
              description={`คุณแน่ใจหรือไม่ว่าต้องการลบเซ็นเซอร์ "${record.name || record.code}"?`}
              onConfirm={() => handleDelete(record.id, record.name || record.code)}
              okText="ลบ"
              cancelText="ยกเลิก"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
              >
                ลบ
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <Spin spinning={loading}>
      <div>
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? 12 : 0 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: isMobile ? 16 : 18 }}>การตั้งค่าเซ็นเซอร์</h3>
            <p style={{ margin: 0, color: '#8c8c8c', fontSize: isMobile ? 12 : 14 }}>
              {isMobile ? `${sensors.length} เซ็นเซอร์` : `ตั้งค่าชื่อและประเภทของเซ็นเซอร์ (${sensors.length} เซ็นเซอร์ทั้งหมด)`}
            </p>
          </div>
          <Button
            type="primary"
            onClick={handleOpenCreateModal}
            size={isMobile ? 'middle' : 'large'}
            block={isMobile}
          >
            {isMobile ? 'เพิ่มเซ็นเซอร์' : 'เพิ่มเซ็นเซอร์ใหม่'}
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
          <strong>หมายเหตุ:</strong> การเปลี่ยนแปลงจะถูกบันทึกในฐานข้อมูล ข้อมูลเซ็นเซอร์จะถูกซิงค์กับระบบหลัก
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
            name="code"
            label="รหัสเซ็นเซอร์ (Sensor Code)"
            rules={[{ required: true, message: 'กรุณากรอกรหัสเซ็นเซอร์' }]}
          >
            <Input placeholder="เช่น airgradient:123456" />
          </Form.Item>
          <Form.Item
            name="name"
            label="ชื่อเซ็นเซอร์"
          >
            <Input placeholder="ชื่อที่ต้องการแสดง (ถ้าไม่ระบุจะใช้ code)" />
          </Form.Item>
          <Form.Item
            name="type"
            label="ประเภท"
            rules={[{ required: true, message: 'กรุณาเลือกประเภทเซ็นเซอร์' }]}
          >
            <Select placeholder="เลือกประเภท" className="font-noto-sans-thai" getPopupContainer={(trigger) => trigger.parentElement}>
              <Option value="fixed">ติดตั้ง</Option>
              <Option value="mobile">เคลื่อนที่</Option>
            </Select>
          </Form.Item>
          <Form.Item name="address" label="ที่อยู่">
            <Input placeholder="สถานที่ติดตั้ง" />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) =>
              getFieldValue('type') !== 'mobile' && (
                <Space size={16} style={{ width: '100%' }} direction={isMobile ? 'vertical' : 'horizontal'}>
                  <Form.Item name="latitude" label="ละติจูด" style={{ flex: 1 }}>
                    <InputNumber style={{ width: '100%' }} placeholder="เช่น 13.7563" />
                  </Form.Item>
                  <Form.Item name="longitude" label="ลองจิจูด" style={{ flex: 1 }}>
                    <InputNumber style={{ width: '100%' }} placeholder="เช่น 100.5018" />
                  </Form.Item>
                </Space>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </Spin>
  );
};
