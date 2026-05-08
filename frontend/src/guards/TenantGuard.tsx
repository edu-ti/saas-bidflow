import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePanel } from '../contexts/PanelContext';

interface TenantGuardProps {
  children: ReactNode;
}

export default function TenantGuard({ children }: TenantGuardProps): React.ReactElement {
  const { isApp } = usePanel();

  const isAuthenticated = !!localStorage.getItem('api_token');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isApp) {
    return <Navigate to="/unauthorized?reason=not_tenant_panel" replace />;
  }

  const storedUser = localStorage.getItem('user');
  let user = { company_id: null };
  try {
    user = storedUser ? JSON.parse(storedUser) : { company_id: null };
  } catch (e) {
    console.error('Failed to parse user', e);
  }

  if (!user.company_id) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}