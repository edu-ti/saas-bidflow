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

    // 1. Restrição de plano: verificar se o módulo está no plano (aplica a TODOS exceto superadmin)
    const allowedModules = user.allowed_modules || [];
    if (!user.is_superadmin && allowedModules.length > 0 && !allowedModules.includes(module)) {
      return false;
    }

    // 2. SuperAdmin ou Admin da empresa têm acesso a todos os módulos do plano
    if (user.is_superadmin || user.is_admin) {
      return true;
    }

    // 3. Se não há permissões detalhadas, permite se o módulo está no plano
    if (!user.permissions || Object.keys(user.permissions).length === 0) {
      return allowedModules.includes(module);
    }

    // 4. Verifica hierarquia: Módulo > Página > Ação
    return user.permissions[module]?.[page]?.[action] === true;
  }, [user]);

  return { hasPermission, user };
};
