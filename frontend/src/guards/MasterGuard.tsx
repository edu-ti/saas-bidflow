import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePanel } from '../contexts/PanelContext';

interface MasterGuardProps {
  children: ReactNode;
}

export default function MasterGuard({ children }: MasterGuardProps): React.ReactElement {
  const { isMaster, currentPanel } = usePanel();

  const isAuthenticated = !!localStorage.getItem('api_token');

  const storedUser = localStorage.getItem('user');
  let user = { role: null, is_superadmin: false };
  try {
    user = storedUser ? JSON.parse(storedUser) : { role: null, is_superadmin: false };
  } catch (e) {
    console.error('Failed to parse user', e);
  }

  const hasMasterRole = user.role?.name === 'master' || user.is_superadmin;

  if (!isAuthenticated) {
    return <Navigate to="/unauthorized?reason=not_authenticated&panel=master" replace />;
  }

  if (!isMaster) {
    const appDomain = import.meta.env.VITE_APP_DOMAIN || 'app.localhost';
    const redirectUrl = window.location.protocol + '//' + appDomain + '/dashboard';
    window.location.href = redirectUrl;
    return <Navigate to={redirectUrl} replace />;
  }

  if (!hasMasterRole) {
    return <Navigate to="/unauthorized?reason=no_master_role&panel=master" replace />;
  }

  return <>{children}</>;
}