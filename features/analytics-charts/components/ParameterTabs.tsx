'use client';

import { Button, Space } from 'antd';

type ParameterTabsProps = {
  activeParameter: string;
  onChange: (parameter: string) => void;
};

const PARAMETERS = [
  { value: 'pm1', label: 'PM₁' },
  { value: 'pm25', label: 'PM₂.₅' },
  { value: 'pm10', label: 'PM₁₀' },
  { value: 'co2', label: 'CO₂' },
  { value: 'temperature', label: 'Temp.' },
  { value: 'humidity', label: 'Humidity' },
  { value: 'tvoc', label: 'TVOC' },
];

export const ParameterTabs = ({ activeParameter, onChange }: ParameterTabsProps) => {
  return (
    <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 8 }}>
      <Space size="small">
        {PARAMETERS.map((param) => (
          <Button
            key={param.value}
            type={activeParameter === param.value ? 'primary' : 'default'}
            onClick={() => onChange(param.value)}
            size="large"
            style={{
              borderRadius: '8px',
              fontWeight: activeParameter === param.value ? 600 : 400,
            }}
          >
            {param.label}
          </Button>
        ))}
      </Space>
    </div>
  );
};
