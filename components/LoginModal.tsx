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
      setError(result.error || 'Login failed');
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
      width={400}
    >
      <div style={{ padding: '20px 0' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
            Login to Dashboard
          </Title>
          <Text type="secondary">
            Enter your credentials to continue
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
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
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
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
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
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
