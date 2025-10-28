'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Space, Modal, message, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userService } from '../services/userService';
import type { AdminUser } from '../types/user';
import { CreateUserModal } from './CreateUserModal';
import dayjs from 'dayjs';

const { Title } = Typography;
const { confirm } = Modal;

export const UserManagementPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID from localStorage
  useEffect(() => {
    const authUser = localStorage.getItem('pm25_auth_user');
    if (authUser) {
      try {
        const parsed = JSON.parse(authUser);
        setCurrentUserId(parsed.user?.id || parsed.id || null);
      } catch (error) {
        console.error('Failed to parse auth user:', error);
      }
    }
  }, []);

  const fetchUsers = async () => {
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = (user: AdminUser) => {
    // Prevent deleting yourself
    if (user.id === currentUserId) {
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
          fetchUsers(); // Refresh list
        } catch (error: any) {
          message.error(error.message || 'Failed to delete user');
        }
      },
    });
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string, record) => (
        <Space>
          <UserOutlined />
          <span>{email}</span>
          {record.id === currentUserId && (
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
      onFilter: (value, record) => record.app_metadata.role === value,
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
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Last Sign In',
      dataIndex: 'last_sign_in_at',
      key: 'last_sign_in_at',
      render: (date: string | undefined) => (date ? dayjs(date).format('MMM DD, YYYY HH:mm') : '-'),
      sorter: (a, b) => {
        if (!a.last_sign_in_at) return 1;
        if (!b.last_sign_in_at) return -1;
        return dayjs(a.last_sign_in_at).unix() - dayjs(b.last_sign_in_at).unix();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteUser(record)}
          disabled={record.id === currentUserId}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>
            User Management
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)} size="large">
            Create User
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
          }}
        />
      </Card>

      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};
