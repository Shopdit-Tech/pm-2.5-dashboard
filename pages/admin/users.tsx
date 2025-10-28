import Head from 'next/head';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserManagementPage } from '@/features/admin-users';

export default function AdminUsers() {
  return (
    <>
      <Head>
        <title>User Management | Air Quality Monitoring</title>
        <meta name="description" content="Manage system users" />
      </Head>

      <ProtectedRoute requireAdmin>
        <UserManagementPage />
      </ProtectedRoute>
    </>
  );
}
