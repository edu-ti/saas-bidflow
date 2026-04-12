import { useState, useEffect } from 'react';
import { LayoutDashboard, KanbanSquare, Building2, FileText, Settings, LogOut, Users, User, Contact, Package, CalendarDays } from 'lucide-react';
import api from '../lib/axios';

export type Page = 'kanban' | 'dashboard' | 'leads' | 'contacts' | 'individual-clients' | 'products' | 'agenda';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export default function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);
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
        .catch(() => {});
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { key: 'dashboard' as Page, name: 'Dashboard BI', icon: <LayoutDashboard size={20} /> },
    { key: 'agenda' as Page, name: 'Agenda Integrada', icon: <CalendarDays size={20} /> },
    { key: 'kanban' as Page,    name: 'Kanban (Licitações)', icon: <KanbanSquare size={20} />, badge: unreadAlerts > 0 ? unreadAlerts : null },
    { key: 'leads' as Page, name: 'Leads', icon: <Users size={20} /> },
    { key: 'contacts' as Page, name: 'Contactos', icon: <Contact size={20} /> },
    { key: 'individual-clients' as Page, name: 'Clientes PF', icon: <User size={20} /> },
    { key: 'products' as Page, name: 'Catálogo de Produtos', icon: <Package size={20} /> },
    { key: null, name: 'Organizações', icon: <Building2 size={20} /> },
    { key: null, name: 'Contratos', icon: <FileText size={20} /> },
    { key: null, name: 'Configurações', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 flex flex-col text-slate-300 flex-shrink-0">
      <div className="p-6 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
          <span className="text-blue-500 mr-2">●</span> BidFlow
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">ERP SaaS</p>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => item.key && onNavigate(item.key)}
            className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
              item.key === activePage
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            } ${!item.key ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
            {item.badge && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <div className="flex items-center space-x-3 mb-4">
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
      </div>
    </div>
  );
}
