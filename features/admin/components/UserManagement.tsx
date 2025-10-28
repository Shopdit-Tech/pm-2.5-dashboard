'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { userService } from '@/features/admin-users/services/userService';
import type { AdminUser } from '@/features/admin-users/types/user';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';

const { Option } = Select;
const { confirm } = Modal;

export const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleDelete = (user: AdminUser) => {
    // Prevent deleting yourself
    if (user.id === currentUser?.id) {
      message.warning('You cannot delete your own account');
      return;
    }

    confirm({
      title: 'Delete User',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to delete this user?</p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.app_metadata.role}
          </p>
          <p style={{ color: '#ff4d4f', marginTop: 12 }}>This action cannot be undone.</p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await userService.deleteUser(user.id);
          message.success('User deleted successfully');
          loadUsers();
        } catch (error: any) {
          message.error(error.message || 'Failed to delete user');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      await userService.createUser({
        email: values.email,
        password: values.password,
        role: values.role,
      });
      
      message.success(`User ${values.email} created successfully!`);
      setIsModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (error: any) {
      message.error(error.message || 'Failed to create user');
    }
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string, record: AdminUser) => (
        <Space>
          <UserOutlined />
          <span>{email}</span>
          {record.id === currentUser?.id && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              You
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: ['app_metadata', 'role'],
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'blue' : 'green'}>{role.toUpperCase()}</Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
      ],
      onFilter: (value: any, record: AdminUser) => record.app_metadata.role === value,
    },
    {
      title: 'Email Verified',
      dataIndex: ['user_metadata', 'email_verified'],
      key: 'email_verified',
      render: (verified: boolean) => (
        <Tag color={verified ? 'success' : 'warning'}>{verified ? 'Verified' : 'Not Verified'}</Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY HH:mm'),
      sorter: (a: AdminUser, b: AdminUser) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Last Sign In',
      dataIndex: 'last_sign_in_at',
      key: 'last_sign_in_at',
      render: (date: string | undefined) => (date ? dayjs(date).format('MMM DD, YYYY HH:mm') : '-'),
      sorter: (a: AdminUser, b: AdminUser) => {
        if (!a.last_sign_in_at) return 1;
        if (!b.last_sign_in_at) return -1;
        return dayjs(a.last_sign_in_at).unix() - dayjs(b.last_sign_in_at).unix();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: AdminUser) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
          disabled={record.id === currentUser?.id}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>User Management</h3>
          <p style={{ margin: 0, color: '#8c8c8c' }}>Manage system users and their roles</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add User
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title="Add New User"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText="Add User"
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="user@example.com" size="large" autoComplete="off" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
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
            <Input.Password placeholder="Password12345!" size="large" autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
            initialValue="user"
          >
            <Select size="large">
              <Option value="user">User</Option>
              <Option value="admin">Administrator</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
