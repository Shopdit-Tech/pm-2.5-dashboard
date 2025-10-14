'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { Alert, Spin } from 'antd';

type ProtectedRouteProps = {
  children: ReactNode;
  requireAdmin?: boolean;
  fallback?: ReactNode;
};

export const ProtectedRoute = ({ children, requireAdmin = false, fallback }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [shouldShowContent, setShouldShowContent] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        setShowLoginModal(true);
        setShouldShowContent(false);
      } else if (requireAdmin && !isAdmin) {
        setShouldShowContent(false);
      } else {
        setShouldShowContent(true);
        setShowLoginModal(false);
      }
    }
  }, [isAuthenticated, isAdmin, loading, requireAdmin]);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setShouldShowContent(true);
  };

  const handleLoginClose = () => {
    setShowLoginModal(false);
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // Show access denied for non-admin users trying to access admin routes
  if (requireAdmin && isAuthenticated && !isAdmin) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Alert
          message="Access Denied"
          description="You do not have permission to access this page. Admin privileges required."
          type="error"
          showIcon
        />
      </div>
    );
  }

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        {fallback || (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Alert
              message="Authentication Required"
              description="Please log in to access this feature."
              type="info"
              showIcon
            />
          </div>
        )}
        <LoginModal
          visible={showLoginModal}
          onClose={handleLoginClose}
          onSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  // Show content if authenticated (and admin if required)
  return <>{shouldShowContent ? children : null}</>;
};
