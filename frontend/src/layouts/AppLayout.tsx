import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { usePanel } from '../contexts/PanelContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import type { Page } from '../components/Sidebar';

export default function AppLayout() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isApp } = usePanel();

  React.useEffect(() => {
    if (!isApp) {
      navigate('/unauthorized');
    }
  }, [isApp, navigate]);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { name: 'Usuário', company: 'Empresa' };
  const companyName = user.company?.name || 'Empresa';

  const handleLogout = () => {
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getPageFromPath = (): Page => {
    return 'dashboard';
  };

  if (!isApp) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      <Sidebar
        activePage={getPageFromPath()}
        onNavigate={(page) => navigate(`/${page === 'dashboard' ? '' : page}`)}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-20 bg-background/80 backdrop-blur-xl border-b border-border-subtle flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">
                <span className="text-primary">{companyName}</span>
              </div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">
                Painel do Tenant
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Tenant Ativo</span>
              <span className="text-xs text-text-secondary font-medium">
                {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-background">
          <Outlet />
        </div>
      </div>
    </div>
  );
}