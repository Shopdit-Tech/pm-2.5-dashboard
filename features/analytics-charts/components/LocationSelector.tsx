'use client';

import { Select, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SensorData } from '@/types/sensor';

const { Option } = Select;

type LocationSelectorProps = {
  sensors: SensorData[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  colors: Record<string, string>;
};

export const LocationSelector = ({
  sensors,
  selectedIds,
  onChange,
  colors,
}: LocationSelectorProps) => {
  const handleAdd = (sensorId: string) => {
    if (!selectedIds.includes(sensorId)) {
      onChange([...selectedIds, sensorId]);
    }
  };

  const handleRemove = (sensorId: string) => {
    onChange(selectedIds.filter((id) => id !== sensorId));
  };

  const availableSensors = sensors.filter((s) => !selectedIds.includes(s.id));

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* Dropdown to add locations */}
      <Select
        style={{ width: 250 }}
        placeholder="Add locations to compare"
        onChange={handleAdd}
        value={undefined}
        showSearch
        optionFilterProp="children"
        suffixIcon={<PlusOutlined />}
      >
        {availableSensors.map((sensor) => (
          <Option key={sensor.id} value={sensor.id}>
            {sensor.name} ({sensor.type})
          </Option>
        ))}
      </Select>

      {/* Selected locations as tags */}
      {selectedIds.length > 0 && (
        <Space wrap size="small">
          {selectedIds.map((id) => {
            const sensor = sensors.find((s) => s.id === id);
            if (!sensor) return null;

            return (
              <Tag
                key={id}
                closable
                onClose={() => handleRemove(id)}
                color={colors[id]}
                style={{ fontSize: 13, padding: '4px 8px' }}
              >
                {sensor.name}
              </Tag>
            );
          })}
        </Space>
      )}
    </Space>
  );
};
