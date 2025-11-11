'use client';

import { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Select, Space, message, Tag, Spin } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { thresholdService } from '../services/thresholdService';
import { useThreshold } from '@/contexts/ThresholdContext';
import type { Threshold, ThresholdMetric } from '../types/threshold';

const { Option } = Select;

const PARAMETER_OPTIONS = [
  { value: 'pm1', label: 'PM₁' },
  { value: 'pm25', label: 'PM₂.₅' },
  { value: 'pm10', label: 'PM₁₀' },
  { value: 'co2_ppm', label: 'CO₂' },
  { value: 'tvoc_ppb', label: 'TVOC' },
  { value: 'temperature_c', label: 'Temperature' },
  { value: 'humidity_rh', label: 'Humidity' },
];

export const ThresholdConfiguration = () => {
  const { refreshThresholds: refreshContextThresholds } = useThreshold();
  const [selectedParameter, setSelectedParameter] = useState<ThresholdMetric>('pm25');
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ min: number; max: number; colorHex: string }>({ 
    min: 0, 
    max: 0, 
    colorHex: '' 
  });
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
    loadThresholds();
  }, []);

  const loadThresholds = async () => {
    setLoading(true);
    try {
      const data = await thresholdService.getThresholds();
      setThresholds(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load thresholds');
    } finally {
      setLoading(false);
    }
  };

  const filteredThresholds = thresholds
    .filter((t) => t.metric === selectedParameter)
    .sort((a, b) => a.sort_order - b.sort_order);

  const handleEdit = (threshold: Threshold) => {
    setEditingId(threshold.id);
    setEditForm({ 
      min: threshold.min_value, 
      max: threshold.max_value,
      colorHex: threshold.color_hex 
    });
  };

  const handleSave = async (thresholdId: string) => {
    try {
      await thresholdService.updateThreshold({
        id: thresholdId,
        min_value: editForm.min,
        max_value: editForm.max,
        color_hex: editForm.colorHex,
      });
      
      message.success('อัปเดตค่าเกณฑ์แล้ว');
      setEditingId(null);
      await loadThresholds();
      // Refresh context to update colors across the app
      await refreshContextThresholds();
    } catch (error: any) {
      message.error(error.message || 'Failed to update threshold');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ min: 0, max: 0, colorHex: '' });
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
      dataIndex: 'color_hex',
      key: 'color_hex',
      width: isMobile ? 60 : 150,
      render: (color: string, record: Threshold) => (
        isMobile ? (
          <div
            style={{
              width: 32,
              height: 20,
              backgroundColor: editingId === record.id ? editForm.colorHex : color,
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
                backgroundColor: editingId === record.id ? editForm.colorHex : color,
                borderRadius: 4,
                border: '1px solid #d9d9d9',
              }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
              {editingId === record.id ? editForm.colorHex : color}
            </span>
          </Space>
        )
      ),
    },
    {
      title: isMobile ? 'ต่ำสุด' : 'ค่าต่ำสุด',
      dataIndex: 'min_value',
      key: 'min_value',
      width: isMobile ? 80 : 150,
      render: (value: number, record: Threshold) => {
        if (editingId === record.id) {
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
      dataIndex: 'max_value',
      key: 'max_value',
      width: isMobile ? 80 : 150,
      render: (value: number, record: Threshold) => {
        if (editingId === record.id) {
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
      render: (_: any, record: Threshold) => {
        if (editingId === record.id) {
          return (
            <Space size="small">
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                onClick={() => handleSave(record.id)}
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
            onClick={() => handleEdit(record)}
          >
            {!isMobile && 'แก้ไข'}
          </Button>
        );
      },
    },
  ];

  return (
    <Spin spinning={loading}>
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
            </Space>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={filteredThresholds}
          rowKey="id"
          pagination={false}
          size={isMobile ? 'small' : 'middle'}
          scroll={isMobile ? { x: 390 } : undefined}
        />

        <div style={{ marginTop: 16, padding: isMobile ? 10 : 12, background: '#f5f5f5', borderRadius: 8, fontSize: isMobile ? 12 : 14 }}>
          <strong>หมายเหตุ:</strong> ค่าเกณฑ์เหล่านี้ควบคุมการแสดงสีทั่วทั้งแดชบอร์ด
          การเปลี่ยนแปลงจะถูกบันทึกในฐานข้อมูลและจะใช้กับกราฟและการแสดงผลทั้งหมด
        </div>
      </div>
    </Spin>
  );
};
