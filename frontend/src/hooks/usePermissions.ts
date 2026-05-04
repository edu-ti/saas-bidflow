import { useCallback } from 'react';

export interface UserPermissions {
  [module: string]: {
    [page: string]: {
      [action: string]: boolean;
    };
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_superadmin: boolean;
  role_id: number | null;
  permissions: UserPermissions | null;
  allowed_modules: string[];
}

export const usePermissions = () => {
  const userString = localStorage.getItem('user');
  const user: User | null = userString ? JSON.parse(userString) : null;

  const hasPermission = useCallback((module: string, page: string, action: string = 'view') => {
    if (!user) return false;

    // Super Admin e Admin Principal (sem role_id ou is_admin=true) têm acesso total
    if (user.is_superadmin || user.is_admin || !user.role_id) {
      return true;
    }

    if (!user.permissions) return false;

    // Verifica hierarquia: Módulo > Página > Ação
    return user.permissions[module]?.[page]?.[action] === true;
  }, [user]);

  return { hasPermission, user };
};
