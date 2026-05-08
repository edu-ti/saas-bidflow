import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { usePanel } from '../contexts/PanelContext';
import { LayoutDashboard, Building2, LogOut, Shield, Activity, Sun, Moon, ChevronRight, Zap, Target, User, ChevronLeft, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MasterLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isMaster } = usePanel();

  React.useEffect(() => {
    if (!isMaster) {
      navigate('/unauthorized');
    }
  }, [isMaster, navigate]);

  const [isExpanded, setIsExpanded] = useState(true);
  const companyLogo = localStorage.getItem('company_logo') || '';

  const handleLogout = () => {
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    toast.success('Sessão mestre encerrada.');
    navigate('/login');
  };

  const menuItems = [
    { key: '/master/dashboard', name: 'Controle Global', icon: <LayoutDashboard size={18} /> },
    { key: '/master/tenants', name: 'Gestão de Tenants', icon: <Building2 size={18} /> },
    { key: '/master/plans', name: 'Planos', icon: <Shield size={18} /> },
    { key: '/master/system-health', name: 'Saúde da Infra', icon: <Activity size={18} /> },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden bg-bg-primary">
      {/* Sidebar Master */}
      <aside 
        className={`
          fixed top-0 left-0 h-screen z-40
          flex flex-col bg-bg-secondary border-r border-border
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isExpanded ? 'w-[260px]' : 'w-[72px]'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
          {!isExpanded ? (
            <div className="flex items-center gap-3 overflow-hidden animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-[15px] text-text-primary tracking-tight truncate">
                Master Panel
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 mx-auto animate-fade-in">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide space-y-8">
          <div className="space-y-1">
            {isExpanded && (
              <p className="px-3 mb-2 text-[11px] font-medium text-text-muted uppercase tracking-wider">
                Navegação Estratégica
              </p>
            )}
            <div className="space-y-0.5">
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.key)}
                    className={`
                      relative w-full flex items-center gap-3 px-3 py-2 rounded-md
                      text-sm font-medium transition-all duration-200 group
                      ${isActive 
                        ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                      }
                      ${!isExpanded ? 'justify-center px-0' : ''}
                    `}
                    title={!isExpanded ? item.name : ''}
                  >
                    {isActive && isExpanded && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full" />
                    )}
                    <span className={isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary transition-colors'}>
                      {item.icon}
                    </span>
                    {isExpanded && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {isExpanded && (
             <div className="px-3 pt-6 border-t border-border mt-4">
                <div className="card p-4 space-y-3 bg-bg-tertiary border-transparent shadow-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                      <Target size={14} className="text-primary" /> SLA Global
                    </div>
                    <span className="text-xs font-semibold text-success">99.9%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-success w-[99.9%]" />
                  </div>
                </div>
             </div>
          )}
        </nav>

        {/* Footer Controls */}
        <div className="p-3 border-t border-border flex flex-col gap-1 shrink-0">
          <button
            onClick={toggleTheme}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-md
              text-sm font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary
              transition-all duration-200
              ${!isExpanded ? 'justify-center px-0' : ''}
            `}
            title={!isExpanded ? (theme === 'dark' ? 'Modo Claro' : 'Modo Escuro') : ''}
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            {isExpanded && <span>{theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}</span>}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-md
              text-sm font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary
              transition-all duration-200
              ${!isExpanded ? 'justify-center px-0' : ''}
            `}
            title={!isExpanded ? 'Expandir' : 'Recolher'}
          >
            {!isExpanded ? <Menu size={18} /> : <ChevronLeft size={18} />}
            {isExpanded && <span>Recolher</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-md
              text-sm font-medium text-text-secondary hover:bg-danger/10 hover:text-danger
              transition-all duration-200
              ${!isExpanded ? 'justify-center px-0' : ''}
            `}
            title={!isExpanded ? 'Sair' : ''}
          >
            <LogOut size={18} />
            {isExpanded && <span>Sair do Master</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isExpanded ? 'ml-[260px]' : 'ml-[72px]'}`}>
        <header className="h-14 bg-bg-secondary/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="font-medium text-text-primary">Master Control</span>
              <ChevronRight size={14} className="text-text-muted" />
              <span className="text-text-secondary capitalize">
                {menuItems.find(i => location.pathname.startsWith(i.key))?.name || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
             <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md bg-bg-tertiary">
              <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                S
              </div>
              <span className="text-sm font-medium text-text-primary pr-2 hidden sm:block">Sysadmin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-bg-primary p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
