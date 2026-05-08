import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { usePanel } from '../contexts/PanelContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import type { Page } from '../components/Sidebar';
import { Bell, Search, Sun, Moon, ChevronRight } from 'lucide-react';

export default function AppLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
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
    const path = window.location.pathname.substring(1);
    return (path as Page) || 'dashboard';
  };

  if (!isApp) {
    return <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-bg-primary">
      <Sidebar
        activePage={getPageFromPath()}
        onNavigate={(page) => navigate(`/${page === 'dashboard' ? '' : page}`)}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ml-[72px] lg:ml-[260px]">
        {/* Topbar Premium */}
        <header className="h-14 bg-bg-secondary/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            {/* Breadcrumbs / Context */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="font-medium text-text-primary">{companyName}</span>
              <ChevronRight size={14} className="text-text-muted" />
              <span className="text-text-secondary capitalize">{getPageFromPath().replace('-', ' ')}</span>
            </div>

            {/* Global Search */}
            <div className="flex-1 max-w-md ml-auto sm:ml-8">
              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar em tudo... (Ctrl+K)" 
                  className="w-full h-8 pl-9 pr-4 bg-bg-tertiary border-transparent focus:bg-bg-primary rounded-md text-sm text-text-primary placeholder:text-text-muted transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 ml-4 shrink-0">
            {/* Action Buttons */}
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors">
              <Bell size={16} />
            </button>
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <div className="w-px h-4 bg-border mx-1" />

            {/* Profile Dropdown Trigger */}
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-bg-tertiary transition-colors">
              <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                {user.name?.[0] || 'U'}
              </div>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-bg-primary p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}