'use client';

import { useState } from 'react';
import { Form, Select, DatePicker, Button, Alert, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import type { SensorData } from '@/types/sensor';
import { BUCKET_SIZES, getBucketSizeById, DEFAULT_BUCKET_SIZE } from '../constants/bucketSizes';
import { generateCSV, downloadCSV, generateFilename } from '../services/exportService';

const { Option } = Select;
const { RangePicker } = DatePicker;

type ExportFormProps = {
  sensors: SensorData[];
};

export const ExportForm = ({ sensors }: ExportFormProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleExport = async (values: any) => {
    try {
      setLoading(true);

      // Get selected sensor
      const sensor = sensors.find((s) => s.id === values.sensorId);
      if (!sensor) {
        message.error('Please select a sensor');
        return;
      }

      if (!sensor.code) {
        message.error('Selected sensor does not have a sensor code');
        return;
      }

      // Get date range
      const [startDate, endDate] = values.dateRange as [Dayjs, Dayjs];
      if (!startDate || !endDate) {
        message.error('Please select a date range');
        return;
      }

      // Get bucket size
      const bucketSize = getBucketSizeById(values.bucketSize);
      if (!bucketSize) {
        message.error('Invalid bucket size selected');
        return;
      }

      message.loading({ content: 'Generating CSV...', key: 'export', duration: 0 });

      // Set start date to beginning of day (00:00:00) in UTC+7
      const startDateBeginning = new Date(startDate.format('YYYY-MM-DD') + 'T00:00:00+07:00');
      
      // Set end date to end of day (23:59:59) in UTC+7
      const endDateEnd = new Date(endDate.format('YYYY-MM-DD') + 'T23:59:59+07:00');

      console.log('📅 Export date range:', {
        startLocal: startDate.format('YYYY-MM-DD') + ' 00:00:00 +07:00',
        endLocal: endDate.format('YYYY-MM-DD') + ' 23:59:59 +07:00',
        startUTC: startDateBeginning.toISOString(),
        endUTC: endDateEnd.toISOString(),
      });

      // Generate CSV
      const csvContent = await generateCSV({
        sensor,
        startDate: startDateBeginning,
        endDate: endDateEnd,
        bucketSize,
      });

      // Download file
      const filename = generateFilename(sensor.name, startDate.toDate(), endDate.toDate());
      downloadCSV(csvContent, filename);

      message.success({ content: 'CSV exported successfully!', key: 'export' });
    } catch (error: any) {
      console.error('Export error:', error);
      message.error({ 
        content: error.message || 'Failed to export CSV', 
        key: 'export' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Disable dates in the future
  const disabledDate = (current: Dayjs) => {
    return current && current > dayjs().endOf('day');
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleExport}
      initialValues={{
        bucketSize: DEFAULT_BUCKET_SIZE,
        dateRange: [dayjs().subtract(7, 'days'), dayjs()],
      }}
      style={{ maxWidth: 600, width: '100%' }}
    >
      {/* Sensor Selection */}
      <Form.Item
        label="Select Sensor"
        name="sensorId"
        rules={[{ required: true, message: 'Please select a sensor' }]}
      >
        <Select
          placeholder="Choose a sensor to export data from"
          size="large"
          showSearch
          optionFilterProp="children"
        >
          {sensors.map((sensor) => (
            <Option key={sensor.id} value={sensor.id}>
              {sensor.name} ({sensor.type})
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Bucket Size Selection */}
      <Form.Item
        label="Select Bucket Size"
        name="bucketSize"
        rules={[{ required: true, message: 'Please select a bucket size' }]}
        extra="Aggregation interval for the exported data"
      >
        <Select placeholder="Choose data aggregation interval" size="large">
          {BUCKET_SIZES.map((bucket) => (
            <Option key={bucket.id} value={bucket.id}>
              {bucket.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Date Range Selection */}
      <Form.Item
        label="Date Range"
        name="dateRange"
        rules={[{ required: true, message: 'Please select a date range' }]}
        extra="Data will be exported for the selected period"
      >
        <RangePicker
          size="large"
          style={{ width: '100%' }}
          disabledDate={disabledDate}
          format="YYYY-MM-DD"
          placeholder={['Start Date', 'End Date']}
        />
      </Form.Item>

      {/* Warning for large date ranges */}
      <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
        prevValues.dateRange !== currentValues.dateRange || 
        prevValues.bucketSize !== currentValues.bucketSize
      }>
        {({ getFieldValue }) => {
          const dateRange = getFieldValue('dateRange');
          if (dateRange && dateRange[0] && dateRange[1]) {
            const days = dateRange[1].diff(dateRange[0], 'days');
            const bucketSize = getFieldValue('bucketSize');
            
            if (days > 365) {
              return (
                <Alert
                  type="warning"
                  message="Large Date Range"
                  description="Exporting more than 1 year of data may take a while and result in a large file."
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              );
            }
            
            if (days > 30 && bucketSize === 'unbucketed') {
              return (
                <Alert
                  type="info"
                  message="Recommendation"
                  description="For date ranges over 30 days, consider using a bucketed aggregation (5min or higher) for better performance."
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              );
            }
          }
          return null;
        }}
      </Form.Item>

      {/* Export Button */}
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          icon={<DownloadOutlined />}
          loading={loading}
          block
        >
          {loading ? 'Generating CSV...' : 'Export CSV'}
        </Button>
      </Form.Item>

      {/* Info */}
      <Alert
        type="info"
        message="Export Information"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>The CSV will include all available sensor metrics</li>
            <li>Missing data fields will be marked with "-"</li>
            <li>Times are provided in both local (UTC+7) and UTC formats</li>
            <li>Heat Index is automatically calculated from temperature and humidity</li>
          </ul>
        }
        showIcon
      />
    </Form>
  );
};
