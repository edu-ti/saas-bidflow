import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Package, ShoppingCart,
  FileText, BarChart3, Settings, ChevronLeft, ChevronRight,
  Folder, Megaphone, Calendar, Gavel, Search, FileSearch,
  MessageSquare, Bot, Link2, Wallet, Box, CreditCard, Wrench,
  LogOut, Sun, Moon, Star, Bell, Zap, Menu, ShieldCheck, Map,
  Radar, Activity, List, Sparkles, Briefcase, Send, MessageCircle,
  Mail, UserSquare
} from 'lucide-react';
import { useTheme, useThemeIcon } from '../context/ThemeContext';

export type Page = 'dashboard' | 'company' | 'users' | 'reports' |
  'sales-funnel' | 'leads' | 'clients' | 'products' | 'proposals' |
  'email-marketing' | 'agenda' | 'bidding-hub' | 'bidding-search' |
  'bidding-bulletin' | 'bidding-manage' | 'documents' | 'legal-consultant' |
  'chat-monitor' | 'chat-monitor-settings' | 'market-analysis' |
  'competitor-analysis' | 'bidding-radar' | 'bidding-monitoring' |
  'bidding-funnel' | 'bidding-capture' | 'auction-details' | 'ai-generator' |
  'licenses' | 'consignment' | 'contracts' | 'inventory' | 'campaigns' |
  'tasks' | 'accounts-payable-receivable' | 'finance' | 'admin' |
  'chatbot' | 'conversations' | 'settings' | 'support';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const navGroups = [
  {
    title: 'Gestão Core',
    items: [
      { id: 'dashboard' as Page, icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'users' as Page, icon: Users, label: 'Equipe / Utilizadores' },
      { id: 'reports' as Page, icon: BarChart3, label: 'Relatórios & BI' },
      { id: 'licenses' as Page, icon: FileText, label: 'Licenças e Certidões' },
    ]
  },
  {
    title: 'Comercial',
    items: [
      { id: 'clients' as Page, icon: UserSquare, label: 'Clientes' },
      { id: 'leads' as Page, icon: Users, label: 'Leads' },
      { id: 'proposals' as Page, icon: FileText, label: 'Propostas' },
      { id: 'sales-funnel' as Page, icon: LayoutDashboard, label: 'Funil de Vendas' },
      { id: 'products' as Page, icon: Box, label: 'Catálogo de Produtos' },
      { id: 'agenda' as Page, icon: Calendar, label: 'Agenda Integrada' },
    ]
  },
  {
    title: 'Licitações RPA',
    items: [
      { id: 'bidding-hub' as Page, icon: Map, label: 'Hub de Licitações' },
      { id: 'bidding-radar' as Page, icon: Radar, label: 'Radar de Licitações' },
      { id: 'bidding-capture' as Page, icon: Activity, label: 'Captura de Editais' },
      { id: 'bidding-monitoring' as Page, icon: FileSearch, label: 'Monitoramento' },
      { id: 'bidding-funnel' as Page, icon: LayoutDashboard, label: 'Funil de Licitações' },
      { id: 'auction-details' as Page, icon: List, label: 'Detalhes do Pregão' },
      { id: 'ai-generator' as Page, icon: Sparkles, label: 'Gerador IA', isPro: true },
    ]
  },
  {
    title: 'Financeiro',
    items: [
      { id: 'finance' as Page, icon: Wallet, label: 'Motor Financeiro' },
      { id: 'accounts-payable-receivable' as Page, icon: CreditCard, label: 'Contas Pagar/Receber' },
      { id: 'contracts' as Page, icon: Briefcase, label: 'Contratos (CLM)' },
    ]
  },
  {
    title: 'Ativos e Estoque',
    items: [
      { id: 'inventory' as Page, icon: Box, label: 'Inventário' },
      { id: 'consignment' as Page, icon: Package, label: 'Gestão de Consignações' },
    ]
  },
  {
    title: 'Módulos Adicionais',
    items: [
      { id: 'campaigns' as Page, icon: Send, label: 'Marketing / Campanhas' },
      { id: 'email-marketing' as Page, icon: Mail, label: 'E-mail Marketing' },
      { id: 'chatbot' as Page, icon: Bot, label: 'Construtor de Chatbots' },
      { id: 'support' as Page, icon: MessageCircle, label: 'Central de Atendimento' },
      { id: 'settings' as Page, icon: Settings, label: 'Configurações' },
    ]
  }
];

const iconMap: Record<string, React.ElementType> = {
  'reports': BarChart3,
  'products': Package,
  'agenda': Calendar,
  'bidding-bulletin': FileSearch,
  'bidding-manage': Gavel,
  'documents': Folder,
  'legal-consultant': Gavel,
  'chat-monitor': MessageSquare,
  'chat-monitor-settings': Settings,
  'market-analysis': BarChart3,
  'competitor-analysis': BarChart3,
  'bidding-monitoring': Search,
  'bidding-capture': Search,
  'auction-details': Gavel,
  'ai-generator': Zap,
  'licenses': FileText,
  'admin': Settings,
};

export default function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(navGroups.map(g => g.title));
  const { theme, toggleTheme } = useTheme();
  const [companyLogo, setCompanyLogo] = useState<string>(localStorage.getItem('company_logo') || '');

  useEffect(() => {
    const handleStorageChange = () => {
      setCompanyLogo(localStorage.getItem('company_logo') || '');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (page: Page) => {
    const pagePath = page === 'dashboard' ? '/' : `/${page}`;
    return location.pathname === pagePath;
  };

  return (
    <aside
      className={`
        relative h-screen shrink-0 z-40
        flex flex-col bg-bg-secondary border-r border-border
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 overflow-hidden animate-fade-in">
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" className="h-32 max-w-[180px] rounded-lg object-contain shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            {!companyLogo && (
              <span className="font-semibold text-[15px] text-text-primary tracking-tight truncate">
                BidFlow
              </span>
            )}
          </div>
        ) : (
          companyLogo ? (
            <img src={companyLogo} alt="Logo" className="w-40 h-40 rounded-lg object-contain shrink-0 mx-auto animate-fade-in" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 mx-auto animate-fade-in">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
          )
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide space-y-4">
        {navGroups.map((group, idx) => {
          const isGroupExpanded = expandedGroups.includes(group.title);
          const showItems = isCollapsed || isGroupExpanded;

          return (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-3 py-1 mb-1 group transition-colors cursor-pointer outline-none"
                >
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider group-hover:text-text-primary transition-colors">
                    {group.title}
                  </p>
                  <ChevronRight
                    size={14}
                    className={`text-text-muted group-hover:text-text-primary transition-transform duration-200 ${isGroupExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
              )}

              {showItems && (
                <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.id);

                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`
                          relative w-full flex items-center gap-3 px-3 py-2 rounded-md
                          text-sm font-medium transition-all duration-200 group
                          ${active
                            ? 'bg-primary/10 text-primary dark:bg-primary/20'
                            : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                          }
                          ${isCollapsed ? 'justify-center px-0' : ''}
                        `}
                        title={isCollapsed ? item.label : ''}
                      >
                        {active && !isCollapsed && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full" />
                        )}
                        <Icon size={18} className={active ? 'text-primary' : 'text-text-muted group-hover:text-text-primary transition-colors'} />
                        {!isCollapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            {(item as any).isPro && (
                              <span className="ml-auto px-1.5 py-0.5 rounded bg-primary/10 text-[9px] font-bold text-primary tracking-wider">PRO</span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="p-3 border-t border-border flex flex-col gap-1 shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            flex items-center gap-3 px-3 py-2 rounded-md
            text-sm font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary
            transition-all duration-200
            ${isCollapsed ? 'justify-center px-0' : ''}
          `}
          title={isCollapsed ? 'Expandir' : 'Recolher'}
        >
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span>Recolher</span>}
        </button>

        <button
          onClick={onLogout}
          className={`
            flex items-center gap-3 px-3 py-2 rounded-md
            text-sm font-medium text-text-secondary hover:bg-danger/10 hover:text-danger
            transition-all duration-200
            ${isCollapsed ? 'justify-center px-0' : ''}
          `}
          title={isCollapsed ? 'Sair' : ''}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
