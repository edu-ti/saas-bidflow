import { useState, useEffect } from 'react';
import {
  LayoutDashboard, KanbanSquare, Building2, FileText, Settings, LogOut,
  Users, User, Contact, Package, CalendarDays, Radar, Mail,
  BarChart3, FileCheck, ClipboardList, Handshake, TrendingUp,
  CreditCard, Wallet, Shield, FolderOpen, FileSearch, ScrollText,
  Briefcase, FileSignature, Sparkles, Sun, Moon, Boxes, Send, ListTodo,
  MessageCircle, Bot
} from 'lucide-react';
import api from '../lib/axios';
import { useTheme } from '../context/ThemeContext';

export type Page =
  // Gestão
  | 'dashboard' | 'company' | 'users' | 'reports'
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
  | 'admin' | 'settings';

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
  const user = storedUser ? JSON.parse(storedUser) : { name: 'Usuário', company_id: 'BidFlow' };

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

  const menuGroups = [
    {
      title: '🔹 Gestão',
      items: [
        { key: 'dashboard' as Page, name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { key: 'company' as Page, name: 'Minha Empresa', icon: <Building2 size={18} /> },
        { key: 'users' as Page, name: 'Equipa / Utilizadores', icon: <Users size={18} /> },
        { key: 'reports' as Page, name: 'Relatórios & BI', icon: <BarChart3 size={18} /> },
        { key: 'licenses' as Page, name: 'Gestão de Licenças e Certidões', icon: <FileCheck size={18} /> },
      ]
    },
    {
      title: '🔹 Comercial',
      items: [
        { key: 'sales-funnel' as Page, name: 'Funil de Vendas', icon: <KanbanSquare size={18} /> },
        { key: 'leads' as Page, name: 'Leads', icon: <Users size={18} /> },
        { key: 'clients' as Page, name: 'Clientes', icon: <User size={18} /> },
        { key: 'products' as Page, name: 'Produtos (Catálogo)', icon: <Package size={18} /> },
        { key: 'proposals' as Page, name: 'Propostas', icon: <FileText size={18} /> },
        { key: 'agenda' as Page, name: 'Agenda Integrada', icon: <CalendarDays size={18} /> },
      ]
    },
    {
      title: '🔹 Licitações',
      items: [
        { key: 'bidding-funnel' as Page, name: 'Funil de Licitações', icon: <KanbanSquare size={18} /> },
        { key: 'bidding-radar' as Page, name: 'Radar Licitações', icon: <Radar size={18} /> },
        { key: 'bidding-monitoring' as Page, name: 'Monitoramento de Licitações', icon: <FileSearch size={18} /> },
        { key: 'bidding-capture' as Page, name: 'Captura de Editais', icon: <ClipboardList size={18} /> },
        { key: 'auction-details' as Page, name: 'Detalhes do Pregão', icon: <ScrollText size={18} /> },
        { key: 'ai-generator' as Page, name: 'Gerador IA', icon: <Sparkles size={18} />, badge: 1 },
      ]
    },
    {
      title: '🔹 Estoque',
      items: [
        { key: 'inventory' as Page, name: 'Inventário', icon: <Boxes size={18} /> },
        { key: 'consignment' as Page, name: 'Gestão de Consignado', icon: <Handshake size={18} /> },
      ]
    },
    {
      title: '🔹 Financeiro',
      items: [
        { key: 'finance' as Page, name: 'Motor Financeiro', icon: <Wallet size={18} /> },
        { key: 'accounts-payable-receivable' as Page, name: 'Contas a Pagar / Receber', icon: <CreditCard size={18} /> },
        { key: 'contracts' as Page, name: 'Contratos', icon: <Briefcase size={18} /> },
      ]
    },
    {
      title: '🔹 Marketing',
      items: [
        { key: 'campaigns' as Page, name: 'Campanhas', icon: <Send size={18} /> },
        { key: 'email-marketing' as Page, name: 'E-mail Marketing', icon: <Mail size={18} /> },
        { key: 'tasks' as Page, name: 'Tarefas', icon: <ListTodo size={18} /> },
      ]
    },
    {
      title: '🔹 Chatbot & Conversas',
      items: [
        { key: 'chatbot' as Page, name: 'Construtor de Chatbot', icon: <Bot size={18} /> },
        { key: 'conversations' as Page, name: 'Conversas', icon: <MessageCircle size={18} /> },
      ]
    },
    {
      title: '🔹 Configurações',
      items: [
        { key: 'admin' as Page, name: 'Administrador', icon: <Shield size={18} /> },
        { key: 'settings' as Page, name: 'Minhas Configurações', icon: <Settings size={18} /> },
      ]
    }
  ];

  return (
    <div
      className={`h-screen bg-slate-900 flex flex-col text-slate-300 flex-shrink-0 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`p-6 pb-4 border-b border-slate-800 transition-all duration-300 ${isExpanded ? '' : 'px-2 py-4'}`}>
        {isExpanded && (
          <>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              <span className="text-blue-500 mr-2">●</span> BidFlow
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">ERP SaaS</p>
          </>
        )}
        {!isExpanded && (
          <h1 className="text-2xl font-bold text-white tracking-tight text-center">
            <span className="text-blue-500">●</span>
          </h1>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-4 overflow-y-auto custom-scrollbar">
        {menuGroups.map((group, gIndex) => (
          <div key={gIndex}>
            {isExpanded && (
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => item.key && onNavigate(item.key)}
                  className={`w-full flex items-center py-2 rounded-md text-sm font-medium transition-colors text-left ${item.key === activePage
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                    } ${!item.key ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isExpanded ? 'px-3' : 'px-0 justify-center'}`}
                >
                  <span className="text-slate-400 flex-shrink-0">{item.icon}</span>
                  {isExpanded && (
                    <>
                      <span className="truncate ml-3">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={`p-4 border-t border-slate-800 bg-slate-950/30 transition-all duration-300 ${isExpanded ? '' : 'p-2'}`}>
        {isExpanded ? (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user.name?.charAt(0).toUpperCase() ?? 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">Empresa #{user.company_id}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
              <LogOut size={18} className="mr-3" />
              Sair do Sistema
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
