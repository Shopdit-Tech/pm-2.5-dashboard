'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { getAllUsers, addUser, deleteUser, updateUser } from '@/data/users';
import type { AuthUser } from '@/types/auth';

const { Option } = Select;

export const UserManagement = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [form] = Form.useForm();

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user: AuthUser) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role,
      // Don't set password for security
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (userId: string) => {
    const success = deleteUser(userId);
    if (success) {
      message.success('User deleted successfully');
      loadUsers();
    } else {
      message.error('Failed to delete user');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUser) {
        // Update existing user
        const updates: Partial<AuthUser> = {
          username: values.username,
          email: values.email,
          role: values.role,
        };
        
        // Only update password if provided
        if (values.password) {
          updates.password = values.password;
        }
        
        const updated = updateUser(editingUser.id, updates);
        if (updated) {
          message.success('User updated successfully');
        } else {
          message.error('Failed to update user');
        }
      } else {
        // Add new user
        addUser({
          username: values.username,
          password: values.password,
          email: values.email,
          role: values.role,
        });
        message.success('User added successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: AuthUser) => (
        <Space>
          <UserOutlined />
          <span style={{ fontWeight: 500 }}>{text}</span>
          {record.role === 'admin' && <Tag color="blue">Admin</Tag>}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'blue' : 'default'}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: AuthUser) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
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
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingUser ? 'Edit User' : 'Add New User'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText={editingUser ? 'Update' : 'Add'}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Please enter valid email' },
            ]}
          >
            <Input placeholder="Enter email (optional)" />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUser ? 'Password (leave empty to keep current)' : 'Password'}
            rules={editingUser ? [] : [{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
            initialValue="user"
          >
            <Select>
              <Option value="user">User</Option>
              <Option value="admin">Administrator</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
