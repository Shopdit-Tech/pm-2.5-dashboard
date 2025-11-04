'use client';

import { useState } from 'react';
import { Modal, Form, Input, Button, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

type LoginModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const LoginModal = ({ visible, onClose, onSuccess }: LoginModalProps) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError(null);

    const result = await login({
      username: values.username,
      password: values.password,
    });

    setLoading(false);

    if (result.success) {
      form.resetFields();
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setError(result.error || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      footer={null}
      centered
      width="90%"
      style={{ maxWidth: 400 }}
    >
      <div style={{ padding: '16px 0' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
            เข้าสู่ระบบแดชบอร์ด
          </Title>
          <Text type="secondary">
            กรอกข้อมูลเพื่อดำเนินการต่อ
          </Text>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Login Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label="อีเมล"
            rules={[
              { required: true, message: 'กรุณากรอกอีเมล' },
              { type: 'email', message: 'กรุณากรอกอีเมลที่ถูกต้อง' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="your@email.com"
              size="large"
              autoFocus
              type="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="รหัสผ่าน"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{ marginTop: 8 }}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
