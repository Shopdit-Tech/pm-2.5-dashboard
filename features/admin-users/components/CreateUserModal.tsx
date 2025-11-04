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
      
      message.success(`สร้างผู้ใช้ ${values.email} สำเร็จ!`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.message || 'ไม่สามารถสร้างผู้ใช้');
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
      title="สร้างผู้ใช้ใหม่"
      open={open}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="สร้างผู้ใช้"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="อีเมล"
          name="email"
          rules={[
            { required: true, message: 'กรุณากรอกอีเมล' },
            { type: 'email', message: 'กรุณากรอกอีเมลที่ถูกต้อง' },
          ]}
        >
          <Input
            placeholder="user@example.com"
            size="large"
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item
          label="รหัสผ่าน"
          name="password"
          rules={[
            { required: true, message: 'กรุณากรอกรหัสผ่าน' },
            { min: 8, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' },
            {
              pattern: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
              message: 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ',
            },
          ]}
          extra="อย่างน้อย 8 ตัวอักษร ต้องมีตัวพิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ (!@#$%^&*)"
        >
          <Input.Password
            placeholder="Password12345!"
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          label="บทบาท"
          name="role"
          initialValue="user"
          rules={[{ required: true, message: 'กรุณาเลือกบทบาท' }]}
        >
          <Select size="large">
            <Option value="user">ผู้ใช้</Option>
            <Option value="admin">ผู้ดูแล</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
