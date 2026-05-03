import { useState, useEffect } from 'react';
import {
  LayoutDashboard, KanbanSquare, Building2, FileText, Settings, LogOut,
  Users, User, Contact, Package, CalendarDays, Radar, Mail,
  BarChart3, FileCheck, ClipboardList, Handshake, TrendingUp,
  CreditCard, Wallet, Shield, FolderOpen, FileSearch, ScrollText,
  Briefcase, FileSignature, Sparkles, Sun, Moon, Boxes, Send, ListTodo,
  MessageCircle, Bot, Lock, Activity, Zap,
  ChevronDown, ChevronRight, Menu, ChevronLeft
} from 'lucide-react';
import api from '../lib/axios';
import { useTheme } from '../context/ThemeContext';

export type Page =
  // Gestão
  | 'dashboard' | 'company' | 'users' | 'reports' | 'reports-dashboard'
  // Comercial
  | 'sales-funnel' | 'leads' | 'clients' | 'proposals' | 'ai-generator' | 'email-marketing' | 'agenda'
  // Licitações
  | 'bidding-radar' | 'bidding-monitoring' | 'bidding-capture' | 'auction-details' | 'bidding-funnel'
  // Operacional
  | 'licenses' | 'consignment' | 'contracts'
  // Estoque
  | 'products' | 'inventory' | 'campaigns' | 'tasks'
  // Financeiro
  | 'accounts-payable-receivable' | 'finance'
  // Chatbot & Conversas
  | 'chatbot' | 'conversations'
  // Configurações
  | 'admin' | 'system-health' | 'settings';

interface MenuItem {
  key: Page;
  name: string;
  icon: JSX.Element;
  badge?: string;
}

interface MenuGroup {
  title: string;
  requiredModule?: string;
  items: MenuItem[];
}

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export default function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [companyLogo, setCompanyLogo] = useState<string>(localStorage.getItem('company_logo') || '');
  const storedUser = localStorage.getItem('user');
  let user = { name: 'Usuário', company_id: 'BidFlow', is_superadmin: false, allowed_modules: [] };
  try {
    const parsed = storedUser ? JSON.parse(storedUser) : null;
    if (parsed) user = { ...user, ...parsed };
  } catch (e) {
    console.error('Failed to parse user in Sidebar', e);
  }

  const hasModule = (moduleKey?: string) => {
    if (!moduleKey) return true;
    if (user.is_superadmin) return true;
    if (!user.allowed_modules) return false;
    return user.allowed_modules.includes(moduleKey);
  };

  useEffect(() => {
    const fetchAlerts = () => {
      api.get('/api/alerts?unread=1')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            setUnreadAlerts(res.data.length);
          }
        })
        .catch(() => { });
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);

    const handleStorageChange = () => {
      setCompanyLogo(localStorage.getItem('company_logo') || '');
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const menuGroups: MenuGroup[] = [
    {
      title: 'Gestão',
      items: [
        { key: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { key: 'admin', name: 'Configurações Empresa', icon: <Shield size={18} /> },
        { key: 'users', name: 'Equipe / Utilizadores', icon: <Users size={18} /> },
        { key: 'reports', name: 'Relatórios & BI', icon: <BarChart3 size={18} /> },
        { key: 'reports-dashboard', name: 'BI Inteligente', icon: <TrendingUp size={18} /> },
        { key: 'licenses', name: 'Licenças e Certidões', icon: <FileCheck size={18} /> },
      ]
    },
    {
      title: 'Comercial',
      requiredModule: 'commercial',
      items: [
        { key: 'clients', name: 'Clientes', icon: <User size={18} /> },
        { key: 'leads', name: 'Leads', icon: <Users size={18} /> },
        { key: 'proposals', name: 'Propostas', icon: <FileText size={18} /> },
        { key: 'sales-funnel', name: 'Funil de Vendas', icon: <KanbanSquare size={18} /> },
        { key: 'products', name: 'Catálogo de Produtos', icon: <Package size={18} /> },
        { key: 'agenda', name: 'Agenda Integrada', icon: <CalendarDays size={18} /> },
      ]
    },
    {
      title: 'Licitações RPA',
      requiredModule: 'bidding',
      items: [
        { key: 'bidding-radar', name: 'Radar de Licitações', icon: <Radar size={18} /> },
        { key: 'bidding-capture', name: 'Captura de Editais', icon: <Activity size={18} /> },
        { key: 'bidding-monitoring', name: 'Monitoramento', icon: <FileSearch size={18} /> },
        { key: 'bidding-funnel', name: 'Funil de Licitações', icon: <KanbanSquare size={18} /> },
        { key: 'auction-details', name: 'Detalhes do Pregão', icon: <ListTodo size={18} /> },
        { key: 'ai-generator', name: 'Gerador IA', icon: <Sparkles size={18} />, badge: 'Pro' },
      ]
    },
    {
      title: 'Financeiro',
      requiredModule: 'financial',
      items: [
        { key: 'finance', name: 'Motor Financeiro', icon: <Wallet size={18} /> },
        { key: 'accounts-payable-receivable', name: 'Contas Pagar/Receber', icon: <CreditCard size={18} /> },
        { key: 'contracts', name: 'Contratos (CLM)', icon: <Briefcase size={18} /> },
      ]
    },
    {
      title: 'Ativos e Estoque',
      items: [
        { key: 'inventory', name: 'Inventário', icon: <Boxes size={18} /> },
        { key: 'consignment', name: 'Gestão de Consignação', icon: <Handshake size={18} /> },
      ]
    },
    {
      title: 'Módulos Adicionais',
      items: [
        { key: 'campaigns', name: 'Marketing / Campanhas', icon: <Send size={18} /> },
        { key: 'email-marketing', name: 'E-mail Marketing', icon: <Mail size={18} /> },
        { key: 'chatbot', name: 'Construtor de Chatbot', icon: <Bot size={18} /> },
        { key: 'conversations', name: 'Central de Atendimento', icon: <MessageCircle size={18} /> },
        { key: 'settings', name: 'Preferências', icon: <Settings size={18} /> },
      ]
    }
  ];

  return (
    <div
      className={`h-screen bg-surface border-r border-border-subtle flex flex-col text-text-secondary flex-shrink-0 transition-all duration-500 ease-out z-50 shadow-platinum ${isExpanded ? 'w-64' : 'w-20'}`}
    >
      <div className={`p-6 pb-6 border-b border-border-subtle transition-all duration-300 relative ${isExpanded ? '' : 'px-2 py-6'}`}>
        {isExpanded ? (
          <div className="flex flex-col items-center gap-4 relative">
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute -right-2 -top-2 p-2 hover:bg-surface-elevated rounded-xl transition-colors text-text-muted hover:text-primary z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="w-full flex justify-center py-2">
              {companyLogo ? (
                <img 
                  src={companyLogo} 
                  alt="Logo" 
                  className="h-28 w-auto max-w-[180px] object-contain animate-in fade-in zoom-in duration-700" 
                />
              ) : (
                <div className="space-y-1 flex flex-col items-center">
                  <h1 className="text-2xl font-black text-text-primary tracking-tighter flex items-center group">
                    <div className="w-2 h-6 bg-gradient-to-b from-[#2563eb] to-[#14b8a6] rounded-full mr-3 shadow-platinum-glow group-hover:scale-y-125 transition-all duration-500" />
                    <span className="text-gradient-gold">BidFlow</span>
                  </h1>
                  <p className="text-[9px] text-text-muted uppercase tracking-[0.4em] font-black opacity-60">Intelligence & Flow</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 hover:bg-surface-elevated rounded-xl transition-colors text-text-muted hover:text-primary"
            >
              <Menu size={24} />
            </button>
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt="Logo" 
                className="w-12 h-12 object-contain rounded-lg bg-white/5 p-1 border border-border-subtle/30 animate-in fade-in zoom-in duration-500" 
              />
            ) : (
              <div className="w-2.5 h-8 bg-gradient-to-b from-[#2563eb] to-[#14b8a6] rounded-full shadow-platinum-glow animate-pulse" />
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 py-6 px-4 space-y-8 overflow-y-auto scrollbar-platinum scroll-smooth">
        {menuGroups.map((group, gIndex) => {
          const isLocked = !hasModule(group.requiredModule);
          return (
            <div key={gIndex} className={isLocked ? 'opacity-30 grayscale' : ''}>
              {isExpanded && (
                <div
                  className="flex items-center justify-between px-3 mb-4 cursor-pointer group/header select-none"
                  onClick={() => toggleGroup(group.title)}
                >
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] opacity-50 group-hover/header:opacity-100 transition-opacity">
                    {group.title}
                  </p>
                  <div className="flex items-center gap-2">
                    {isLocked && <Lock size={12} className="text-text-muted" />}
                    <ChevronDown
                      size={12}
                      className={`text-text-muted transition-transform duration-300 ${collapsedGroups.includes(group.title) ? '-rotate-90' : ''}`}
                    />
                  </div>
                </div>
              )}
              <div className={`space-y-1.5 transition-all duration-300 overflow-hidden ${collapsedGroups.includes(group.title) && isExpanded ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                {group.items.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (isLocked) {
                        alert(`Módulo Premium: Entre em contato para ativar o acesso a ${group.title}`);
                      } else if (item.key) {
                        onNavigate(item.key);
                      }
                    }}
                    className={`w-full flex items-center py-3 rounded-2xl text-sm font-black transition-all duration-500 text-left group ${item.key === activePage && !isLocked
                      ? 'bg-primary/5 text-primary border border-primary/20 shadow-platinum-glow-sm'
                      : 'hover:bg-surface-elevated/50 hover:text-primary text-text-muted'
                      } ${!item.key ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isExpanded ? 'px-4' : 'px-0 justify-center'}`}
                  >
                    <span className={`flex-shrink-0 transition-all duration-500 group-hover:scale-110 ${item.key === activePage && !isLocked ? 'text-primary' : ''}`}>{item.icon}</span>
                    {isExpanded && (
                      <>
                        <span className="truncate ml-4 tracking-tight uppercase text-[11px] group-hover:translate-x-1 transition-transform">{item.name}</span>
                        {item.badge && !isLocked && (
                          <span className="ml-auto bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-lg border border-primary/20 uppercase tracking-widest shadow-platinum-glow-sm">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      <div className={`p-5 border-t border-border-subtle bg-surface-elevated/20 transition-all duration-300 ${isExpanded ? '' : 'px-2'}`}>
        {isExpanded ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-surface-elevated/40 border border-border-subtle shadow-inner-platinum group hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-black text-xl shadow-platinum-glow-sm group-hover:scale-110 transition-transform duration-500">
                {user.name?.charAt(0).toUpperCase() ?? 'B'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-text-primary truncate tracking-tight uppercase">{user.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Zap size={10} className="text-primary animate-pulse" />
                  <p className="text-[9px] text-text-muted truncate uppercase tracking-widest font-black opacity-60">Neural Account</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center p-3 text-text-muted hover:text-primary hover:bg-surface-elevated rounded-2xl transition-all border border-border-subtle shadow-inner-platinum"
                title="Alternar Tema"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={onLogout}
                className="flex items-center justify-center p-3 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-border-subtle shadow-inner-platinum"
                title="Sair da Operação"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-black text-xl shadow-platinum-glow-sm cursor-pointer hover:scale-110 transition-transform">
              {user.name?.charAt(0).toUpperCase() ?? 'B'}
            </div>
            <button
              onClick={toggleTheme}
              className="p-3.5 text-text-muted hover:text-primary hover:bg-surface-elevated rounded-2xl transition-all shadow-inner-platinum border border-border-subtle"
            >
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={onLogout}
              className="p-3.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all shadow-inner-platinum border border-border-subtle">
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
