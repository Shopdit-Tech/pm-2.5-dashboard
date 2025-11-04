'use client';

import { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Select, Space, message, Tag } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { PARAMETER_COLOR_RANGES } from '@/constants/airQualityRanges';
import type { ColorRange, ParameterType } from '@/types/sensor';

const { Option } = Select;

const STORAGE_KEY = 'threshold_config';

const PARAMETER_OPTIONS = [
  { value: 'pm1', label: 'PM₁' },
  { value: 'pm25', label: 'PM₂.₅' },
  { value: 'pm10', label: 'PM₁₀' },
  { value: 'co2', label: 'CO₂' },
  { value: 'tvoc', label: 'TVOC' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'humidity', label: 'Humidity' },
];

export const ThresholdConfiguration = () => {
  const [selectedParameter, setSelectedParameter] = useState<ParameterType>('pm25');
  const [ranges, setRanges] = useState<ColorRange[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
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
    loadRanges(selectedParameter);
  }, [selectedParameter]);

  const loadRanges = (parameter: ParameterType) => {
    // Try to load custom config from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const configs = JSON.parse(saved);
        if (configs[parameter]) {
          setRanges(configs[parameter]);
          return;
        }
      } catch (error) {
        console.error('Failed to load threshold config:', error);
      }
    }
    
    // Fall back to default ranges
    setRanges(PARAMETER_COLOR_RANGES[parameter]);
  };

  const handleEdit = (index: number, range: ColorRange) => {
    setEditingIndex(index);
    setEditForm({ min: range.min, max: range.max });
  };

  const handleSave = (index: number) => {
    // Update ranges
    const updatedRanges = [...ranges];
    updatedRanges[index] = {
      ...updatedRanges[index],
      min: editForm.min,
      max: editForm.max,
    };
    setRanges(updatedRanges);

    // Save to localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    const configs = saved ? JSON.parse(saved) : {};
    configs[selectedParameter] = updatedRanges;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));

    message.success('อัปเดตค่าเกณฑ์แล้ว');
    setEditingIndex(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditForm({ min: 0, max: 0 });
  };

  const handleReset = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const configs = JSON.parse(saved);
      delete configs[selectedParameter];
      if (Object.keys(configs).length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
      }
    }
    loadRanges(selectedParameter);
    message.success('รีเซ็ตค่าเกณฑ์เป็นค่าเริ่มต้นแล้ว');
  };

  const handleResetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    loadRanges(selectedParameter);
    message.success('รีเซ็ตค่าเกณฑ์ทั้งหมดแล้ว');
  };

  const columns = [
    {
      title: 'ระดับ',
      dataIndex: 'level',
      key: 'level',
      width: isMobile ? 80 : undefined,
      render: (level: string) => (
        <span style={{ fontWeight: 500, textTransform: 'capitalize', fontSize: isMobile ? 12 : 14 }}>
          {level}
        </span>
      ),
    },
    {
      title: 'สี',
      dataIndex: 'color',
      key: 'color',
      width: isMobile ? 60 : 150,
      render: (color: string) => (
        isMobile ? (
          <div
            style={{
              width: 32,
              height: 20,
              backgroundColor: color,
              borderRadius: 4,
              border: '1px solid #d9d9d9',
              margin: '0 auto',
            }}
          />
        ) : (
          <Space>
            <div
              style={{
                width: 40,
                height: 24,
                backgroundColor: color,
                borderRadius: 4,
                border: '1px solid #d9d9d9',
              }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{color}</span>
          </Space>
        )
      ),
    },
    {
      title: isMobile ? 'ต่ำสุด' : 'ค่าต่ำสุด',
      dataIndex: 'min',
      key: 'min',
      width: isMobile ? 80 : 150,
      render: (value: number, _: ColorRange, index: number) => {
        if (editingIndex === index) {
          return (
            <InputNumber
              value={editForm.min}
              onChange={(val) => setEditForm({ ...editForm, min: val || 0 })}
              style={{ width: '100%' }}
              min={0}
              size={isMobile ? 'small' : 'middle'}
            />
          );
        }
        return <Tag style={{ fontSize: isMobile ? 11 : 13 }}>{value}</Tag>;
      },
    },
    {
      title: isMobile ? 'สูงสุด' : 'ค่าสูงสุด',
      dataIndex: 'max',
      key: 'max',
      width: isMobile ? 80 : 150,
      render: (value: number, _: ColorRange, index: number) => {
        if (editingIndex === index) {
          return (
            <InputNumber
              value={editForm.max}
              onChange={(val) => setEditForm({ ...editForm, max: val || 0 })}
              style={{ width: '100%' }}
              min={editForm.min}
              size={isMobile ? 'small' : 'middle'}
            />
          );
        }
        return <Tag style={{ fontSize: isMobile ? 11 : 13 }}>{value}</Tag>;
      },
    },
    {
      title: isMobile ? '' : 'ดำเนินการ',
      key: 'actions',
      width: isMobile ? 90 : 150,
      align: 'center' as const,
      render: (_: any, record: ColorRange, index: number) => {
        if (editingIndex === index) {
          return (
            <Space size="small">
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                onClick={() => handleSave(index)}
              >
                {!isMobile && 'บันทึก'}
              </Button>
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={handleCancel}
              >
                {!isMobile && 'ยกเลิก'}
              </Button>
            </Space>
          );
        }
        return (
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(index, record)}
          >
            {!isMobile && 'แก้ไข'}
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: isMobile ? 16 : 18 }}>การตั้งค่าค่าเกณฑ์</h3>
          <p style={{ margin: 0, color: '#8c8c8c', fontSize: isMobile ? 12 : 14 }}>
            {isMobile ? 'ตั้งค่าเกณฑ์สี' : 'ตั้งค่าเกณฑ์สีคุณภาพอากาศสำหรับแต่ละพารามิเตอร์'}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        {isMobile ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 13 }}>เลือกพารามิเตอร์:</div>
              <Select
                value={selectedParameter}
                onChange={setSelectedParameter}
                style={{ width: '100%' }}
                size="middle"
              >
                {PARAMETER_OPTIONS.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </div>
            <Space style={{ width: '100%' }} size="small">
              <Button onClick={handleReset} block style={{ flex: 1 }}>
                รีเซ็ตพารามิเตอร์
              </Button>
              <Button onClick={handleResetAll} danger block style={{ flex: 1 }}>
                รีเซ็ตทั้งหมด
              </Button>
            </Space>
          </Space>
        ) : (
          <Space size="middle" style={{ width: '100%' }}>
            <div>
              <strong>เลือกพารามิเตอร์:</strong>
            </div>
            <Select
              value={selectedParameter}
              onChange={setSelectedParameter}
              style={{ width: 200 }}
              size="large"
            >
              {PARAMETER_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
            <Button onClick={handleReset}>
              รีเซ็ตพารามิเตอร์นี้
            </Button>
            <Button onClick={handleResetAll} danger>
              รีเซ็ตทั้งหมด
            </Button>
          </Space>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={ranges}
        rowKey={(record, index) => `${record.level}-${index}`}
        pagination={false}
        size={isMobile ? 'small' : 'middle'}
        scroll={isMobile ? { x: 390 } : undefined}
      />

      <div style={{ marginTop: 16, padding: isMobile ? 10 : 12, background: '#f5f5f5', borderRadius: 8, fontSize: isMobile ? 12 : 14 }}>
        <strong>หมายเหตุ:</strong> ค่าเกณฑ์เหล่านี้ควบคุมการแสดงสีทั่วทั้งแดชบอร์ด
        การเปลี่ยนแปลงจะถูกบันทึกใน localStorage และจะใช้กับกราฟและการแสดงผลทั้งหมด
      </div>
    </div>
  );
};
