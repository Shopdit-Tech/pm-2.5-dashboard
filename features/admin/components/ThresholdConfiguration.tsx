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

    message.success('Threshold updated successfully');
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
    message.success('Thresholds reset to defaults');
  };

  const handleResetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    loadRanges(selectedParameter);
    message.success('All thresholds reset to defaults');
  };

  const columns = [
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
          {level}
        </span>
      ),
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      width: 150,
      render: (color: string) => (
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
      ),
    },
    {
      title: 'Min Value',
      dataIndex: 'min',
      key: 'min',
      width: 150,
      render: (value: number, _: ColorRange, index: number) => {
        if (editingIndex === index) {
          return (
            <InputNumber
              value={editForm.min}
              onChange={(val) => setEditForm({ ...editForm, min: val || 0 })}
              style={{ width: '100%' }}
              min={0}
            />
          );
        }
        return <Tag>{value}</Tag>;
      },
    },
    {
      title: 'Max Value',
      dataIndex: 'max',
      key: 'max',
      width: 150,
      render: (value: number, _: ColorRange, index: number) => {
        if (editingIndex === index) {
          return (
            <InputNumber
              value={editForm.max}
              onChange={(val) => setEditForm({ ...editForm, max: val || 0 })}
              style={{ width: '100%' }}
              min={editForm.min}
            />
          );
        }
        return <Tag>{value}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: ColorRange, index: number) => {
        if (editingIndex === index) {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                onClick={() => handleSave(index)}
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
            onClick={() => handleEdit(index, record)}
          >
            Edit
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>Threshold Configuration</h3>
          <p style={{ margin: 0, color: '#8c8c8c' }}>
            Configure air quality color thresholds for each parameter
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Space size="middle" style={{ width: '100%' }}>
          <div>
            <strong>Select Parameter:</strong>
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
            Reset This Parameter
          </Button>
          <Button onClick={handleResetAll} danger>
            Reset All Parameters
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={ranges}
        rowKey={(record, index) => `${record.level}-${index}`}
        pagination={false}
      />

      <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
        <strong>Note:</strong> These thresholds control the color coding throughout the dashboard.
        Changes are saved to browser localStorage and will apply to all charts and visualizations.
      </div>
    </div>
  );
};
