'use client';

import { Modal, Form, Input, Select, message } from 'antd';
import { useState } from 'react';
import type { CreateUserRequest } from '../types/user';
import { userService } from '../services/userService';

const { Option } = Select;

type CreateUserModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const CreateUserModal = ({ open, onClose, onSuccess }: CreateUserModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: CreateUserRequest) => {
    try {
      setLoading(true);
      
      await userService.createUser(values);
      
      message.success(`User ${values.email} created successfully!`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Create New User"
      open={open}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Create User"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            placeholder="user@example.com"
            size="large"
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please enter password' },
            { min: 8, message: 'Password must be at least 8 characters' },
            {
              pattern: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
              message: 'Password must contain uppercase, number, and special character',
            },
          ]}
          extra="Min 8 characters with uppercase, number, and special character (!@#$%^&*)"
        >
          <Input.Password
            placeholder="Password12345!"
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          initialValue="user"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select size="large">
            <Option value="user">User</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
