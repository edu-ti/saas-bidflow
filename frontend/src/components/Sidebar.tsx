import { useState, useEffect } from 'react';
import {
  LayoutDashboard, KanbanSquare, Building2, FileText, Settings, LogOut,
  Users, User, Contact, Package, CalendarDays, Radar, Mail,
  BarChart3, FileCheck, ClipboardList, Handshake, TrendingUp,
  CreditCard, Wallet, Shield, FolderOpen, FileSearch, ScrollText,
  Briefcase, FileSignature, Sparkles, Sun, Moon, Boxes, Send, ListTodo,
  MessageCircle, Bot, Lock, Activity
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
  const [isExpanded, setIsExpanded] = useState(false);
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
    return () => clearInterval(interval);
  }, []);

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
      title: 'Licitações',
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
      title: 'Estoque',
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
      className={`h-screen bg-background border-r border-border-subtle flex flex-col text-text-secondary flex-shrink-0 transition-all duration-500 ease-out z-50 ${isExpanded ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`p-6 pb-6 border-b border-border-subtle transition-all duration-300 ${isExpanded ? '' : 'px-2 py-6'}`}>
        {isExpanded && (
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tighter flex items-center group">
              <div className="w-2 h-6 bg-primary rounded-full mr-3 shadow-platinum-glow group-hover:scale-y-110 transition-transform" />
              <span className="text-gradient-gold">BidFlow</span>
            </h1>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.3em] font-bold">Strategic Intelligence</p>
          </div>
        )}
        {!isExpanded && (
          <div className="flex justify-center">
            <div className="w-2 h-8 bg-primary rounded-full shadow-platinum-glow" />
          </div>
        )}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto custom-scrollbar scroll-smooth">
        {menuGroups.map((group, gIndex) => {
          const isLocked = !hasModule(group.requiredModule);
          return (
          <div key={gIndex} className={isLocked ? 'opacity-40 grayscale' : ''}>
            {isExpanded && (
              <div className="flex items-center justify-between px-3 mb-3">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                  {group.title}
                </p>
                {isLocked && <Lock size={10} className="text-text-muted" />}
              </div>
            )}
            <div className="space-y-1">
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
                  className={`w-full flex items-center py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-left group ${item.key === activePage && !isLocked
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-platinum-glow'
                    : 'hover:bg-surface-elevated/50 hover:text-text-primary text-text-muted'
                    } ${!item.key ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isExpanded ? 'px-4' : 'px-0 justify-center'}`}
                >
                  <span className={`flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${item.key === activePage && !isLocked ? 'text-primary' : ''}`}>{item.icon}</span>
                  {isExpanded && (
                    <>
                      <span className="truncate ml-3 tracking-tight">{item.name}</span>
                      {item.badge && !isLocked && (
                        <span className="ml-auto bg-primary/20 text-primary text-[9px] font-black px-1.5 py-0.5 rounded border border-primary/30 uppercase tracking-tighter">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )})}
      </nav>

      <div className={`p-4 border-t border-border-subtle bg-surface/20 transition-all duration-300 ${isExpanded ? '' : 'px-2'}`}>
        {isExpanded ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-elevated/30 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-amber-500 to-amber-600 flex items-center justify-center text-background font-black text-lg shadow-elevation-high">
                {user.name?.charAt(0).toUpperCase() ?? 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate tracking-tight">{user.name}</p>
                <p className="text-[10px] text-text-muted truncate uppercase tracking-widest font-bold">Premium Plan</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
               <button
                onClick={toggleTheme}
                className="flex items-center justify-center p-2.5 text-text-muted hover:text-primary hover:bg-surface-elevated rounded-xl transition-all border border-white/5"
                title="Alternar Tema"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={onLogout}
                className="flex items-center justify-center p-2.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-white/5"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-background font-black text-lg shadow-elevation-high">
                {user.name?.charAt(0).toUpperCase() ?? 'A'}
              </div>
             <button
              onClick={toggleTheme}
              className="p-3 text-text-muted hover:text-primary hover:bg-surface-elevated rounded-xl transition-all"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={onLogout}
              className="p-3 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
