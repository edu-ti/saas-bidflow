import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Building2, LogOut, Shield, Activity, Sun, Moon, ChevronRight, Zap, Target, ShieldCheck, Globe, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MasterLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const companyLogo = localStorage.getItem('company_logo') || '';

  const handleLogout = () => {
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    toast.success('Sessão mestre encerrada.');
    navigate('/login');
  };

  const menuItems = [
    { key: '/master/dashboard', name: 'Controle Global', icon: <LayoutDashboard size={20} /> },
    { key: '/master/tenants', name: 'Gestão de Tenants', icon: <Building2 size={20} /> },
    { key: '/master/plans', name: 'Arquitetura de Planos', icon: <Shield size={20} /> },
    { key: '/master/system-health', name: 'Saúde da Infra', icon: <Activity size={20} /> },
  ];

  return (
    <div className="min-h-screen flex bg-background text-text-primary overflow-hidden transition-colors duration-500">
      {/* Sidebar Master Platinum Architecture */}
      <aside className={`flex-shrink-0 bg-surface border-r border-border-subtle flex flex-col relative transition-all duration-500 ease-out shadow-platinum ${isExpanded ? 'w-80' : 'w-24'}`}>
        
        {/* Header - Brand Identity */}
        <div className="h-28 flex flex-col justify-center px-10 border-b border-border-subtle bg-surface-elevated/20 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
            <Shield size={60} className="text-primary" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" className={`${isExpanded ? 'w-11 h-11' : 'w-10 h-10'} rounded-2xl object-contain bg-white/5 p-1 border border-border-subtle shadow-platinum-glow-sm group-hover:rotate-12 transition-all duration-500`} />
            ) : (
              <div className={`${isExpanded ? 'w-11 h-11' : 'w-10 h-10'} rounded-2xl bg-gradient-primary flex items-center justify-center shadow-platinum-glow-sm group-hover:rotate-12 transition-all duration-500`}>
                <Shield size={isExpanded ? 22 : 20} className="text-white" />
              </div>
            )}
            {isExpanded && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500">
                <span className="font-black text-xl tracking-tighter text-gradient-gold uppercase leading-none">MASTER PANEL</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-platinum-glow" />
                  <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.4em]">Governance Core</span>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`absolute -right-2 top-1/2 -translate-y-1/2 p-2 bg-surface border border-border-subtle rounded-xl text-text-muted hover:text-primary transition-all shadow-platinum-glow-sm ${!isExpanded ? 'rotate-180' : ''}`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Navigation Core */}
        <nav className="flex-1 overflow-y-auto py-10 px-6 space-y-10 scrollbar-platinum">
          <div>
            {isExpanded && <p className="px-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.5em] mb-6 animate-in fade-in duration-500">Navegação Estratégica</p>}
            <div className="space-y-3">
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.key)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all group relative overflow-hidden ${isActive
                      ? 'bg-primary text-white shadow-platinum-glow'
                      : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary border border-transparent hover:border-border-subtle/50'
                      }`}
                    title={!isExpanded ? item.name : ''}
                  >
                    <div className="flex items-center gap-5 relative z-10">
                      <span className={`transition-all duration-500 ${isActive ? 'text-white scale-110' : 'text-primary group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      {isExpanded && <span className="tracking-widest animate-in fade-in slide-in-from-left-2 duration-500">{item.name}</span>}
                    </div>
                    {isActive && isExpanded && <ChevronRight size={14} className="relative z-10 opacity-60 animate-in fade-in duration-500" />}
                    {!isActive && <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                );
              })}
            </div>
          </div>

          {isExpanded && (
            <div className="pt-6 border-t border-border-subtle/30 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="platinum-card p-6 bg-surface-elevated/40 border border-border-subtle/30 shadow-inner-platinum space-y-4 group">
                <div className="flex items-center justify-between">
                  <Target size={18} className="text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">99.9%</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-text-primary uppercase tracking-widest">SLA Global</p>
                  <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest italic">Infra-Status Nominal</p>
                </div>
                <div className="w-full bg-background rounded-full h-1 overflow-hidden">
                  <div className="h-full bg-primary w-[99.9%] shadow-platinum-glow-sm" />
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* User Profile & Global Controls */}
        <div className={`p-8 border-t border-border-subtle bg-surface-elevated/30 backdrop-blur-xl ${!isExpanded ? 'px-4' : ''}`}>
          {isExpanded ? (
            <div className="platinum-card p-5 flex items-center gap-4 mb-8 bg-background/40 border border-border-subtle shadow-inner-platinum group hover:border-primary/40 transition-all duration-500 animate-in fade-in slide-in-from-left-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-black text-lg shadow-platinum-glow-sm group-hover:rotate-12 transition-transform duration-500">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-text-primary truncate uppercase tracking-[0.2em] group-hover:text-primary transition-colors">SYSADMIN</p>
                <p className="text-[10px] text-text-secondary truncate font-bold">master@bidflow.io</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-8">
               <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center text-white shadow-platinum-glow-sm">
                 <User size={20} />
               </div>
            </div>
          )}

          <div className={`grid ${isExpanded ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            <button
              onClick={toggleTheme}
              className="flex flex-col items-center justify-center gap-2 py-4 px-3 text-text-secondary hover:text-primary bg-surface-elevated border border-border-subtle rounded-2xl transition-all shadow-inner-platinum hover:scale-[1.05] group"
              title={theme === 'dark' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
            >
              {theme === 'dark' ? <Moon size={20} className="group-hover:rotate-45 transition-transform duration-500" /> : <Sun size={20} className="group-hover:-rotate-12 transition-transform duration-500" />}
              {isExpanded && <span className="text-[8px] font-black uppercase tracking-[0.2em] animate-in fade-in duration-500">Tema</span>}
            </button>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center gap-2 py-4 px-3 text-text-secondary hover:text-red-500 bg-surface-elevated border border-border-subtle rounded-2xl transition-all shadow-inner-platinum hover:scale-[1.05] group"
              title="Logout de Segurança"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              {isExpanded && <span className="text-[8px] font-black uppercase tracking-[0.2em] animate-in fade-in duration-500">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-background relative scrollbar-platinum selection:bg-primary/20 selection:text-primary">
        <div className="h-full w-full max-w-[1920px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
