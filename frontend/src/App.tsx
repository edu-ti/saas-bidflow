import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { Activity, Bell, Sun, Moon } from 'lucide-react';
import type { Page } from './components/Sidebar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Leads from './components/leads/LeadsDashboard';
import Clients from './components/Clients';
import Products from './components/Products';
import Agenda from './components/Agenda';
import BiddingRadar from './components/BiddingRadar';
import EmailMarketing from './components/EmailMarketing';
import UsersManagement from './components/UsersManagement';
import SalesFunnel from './components/SalesFunnel';
import Proposals from './components/Proposals';
import AIGenerator from './components/AIGenerator';
import BiddingMonitoring from './components/BiddingMonitoring';
import BiddingCapture from './components/BiddingCapture';
import BiddingFunnel from './components/BiddingFunnel';
import BiddingHub from './components/BiddingHub';
import BiddingSearch from './components/BiddingSearch';
import BiddingBulletin from './components/BiddingBulletin';
import ManageBiddings from './components/ManageBiddings';
import ManageDocuments from './components/ManageDocuments';
import LegalConsultant from './components/LegalConsultant';
import BidAnalyst from './components/BidAnalyst';
import ChatMonitor from './components/ChatMonitor';
import ChatMonitorSettings from './components/ChatMonitorSettings';
import MarketAnalysis from './components/MarketAnalysis';
import CompetitorAnalysis from './components/CompetitorAnalysis';
import AuctionDetails from './components/AuctionDetails';
import Licenses from './components/Licenses';
import Consignment from './components/Consignment';
import Contracts from './components/contracts/ContractsDashboard';
import Inventory from './components/inventory/InventoryDashboard';
import Campaigns from './components/Campaigns';
import Tasks from './components/Tasks';
import ReportsBIPage from './components/ReportsBIPage';
import AccountsPayableReceivable from './components/AccountsPayableReceivable';
import Finance from './components/financial/FinanceDashboard';
import Admin from './components/Admin';
import Company from './components/Company';
import ChatbotBuilder from './components/ChatbotBuilder';
import Conversations from './components/Conversations';
import Settings from './components/Settings';
import MasterLayout from './layouts/MasterLayout';
import MasterDashboard from './components/master/MasterDashboard';
import TenantList from './components/master/TenantList';
import PlansManagement from './components/master/PlansManagement';
import SystemHealth from './components/master/SystemHealth';
import LandingPage from './pages/LandingPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import MasterGuard from './guards/MasterGuard';
import TenantGuard from './guards/TenantGuard';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Componente para rotas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('api_token');

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Componente para rotas exclusivas do Super Admin
function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const apiToken = localStorage.getItem('api_token');
  const isAuthenticated = !!apiToken;
  const storedUser = localStorage.getItem('user');
  let user = { is_superadmin: false, email: '' };
  try {
    user = JSON.parse(storedUser || '{}');
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user.is_superadmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}

// Helper para verificar permissão no frontend (Atualizado para 3 níveis)
const hasPermission = (module?: string, page?: string, action: string = 'view') => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return false;
  
  try {
    const user = JSON.parse(storedUser);
    if (user.is_superadmin || user.is_admin) return true;
    if (!user.permissions || !module || !page) return false; 
    
    // Suporte ao formato antigo (fallback) se necessário, mas focado no novo
    if (typeof user.permissions[module] === 'object') {
       return user.permissions[module]?.[page]?.[action] === true;
    }
    
    return false;
  } catch {
    return false;
  }
};

// Componente para rotas com permissão específica
function PermissionRoute({ children, module, page }: { 
  children: React.ReactNode, 
  module: string, 
  page: string
}) {
  if (!hasPermission(module, page, 'view')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

// Componente Topbar - Premium Design
function Topbar({ title }: { title?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, resolvedTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    const titles: Record<string, string> = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/company': 'Empresa',
      '/users': 'Usuários',
      '/reports': 'Relatórios',
      '/sales-funnel': 'Funil de Vendas',
      '/leads': 'Leads',
      '/clients': 'Clientes',
      '/products': 'Produtos',
      '/proposals': 'Propostas',
      '/agenda': 'Agenda',
      '/bidding-funnel': 'Funil de Licitações',
      '/bidding-hub': 'Hub de Licitações',
      '/bidding-search': 'Buscar Licitações',
      '/bidding-bulletin': 'Boletim de Licitações',
      '/bidding-manage': 'Gerenciar Licitações',
      '/documents': 'Documentos',
      '/legal-consultant': 'Consultor Jurídico',
      '/bid-analyst': 'Analista de Edital',
      '/chat-monitor': 'Monitoramento',
      '/chat-monitor-settings': 'Configurações Chat',
      '/market-analysis': 'Análise de Mercado',
      '/competitor-analysis': 'Concorrentes',
      '/bidding-radar': 'Radar de Licitações',
      '/bidding-monitoring': 'Monitoramento',
      '/bidding-capture': 'Captação',
      '/auction-details': 'Detalhes do Pregão',
      '/ai-generator': 'Gerador IA',
      '/licenses': 'Licenças',
      '/consignment': 'Consignação',
      '/contracts': 'Contratos',
      '/inventory': 'Estoque',
      '/campaigns': 'Campanhas',
      '/tasks': 'Tarefas',
      '/finance': 'Financeiro',
      '/accounts-payable-receivable': 'Contas',
      '/chatbot': 'Chatbot',
      '/conversations': 'Conversas',
      '/support': 'Central de Atendimento',
      '/admin': 'Administração',
      '/settings': 'Configurações',
    };
    return titles[path] || 'Dashboard';
  };

  // Fechar menus ao clicar fora
  const menuRef = React.useRef<HTMLDivElement>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showUserMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showNotifications]);

  // Buscar notificações
  const fetchNotifications = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/alerts`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.data || data || [];
        setNotifications(items.slice(0, 20));
        setUnreadCount(items.filter((n: any) => !n.is_read).length);
      }
    } catch {
      // Silently fail - notifications are not critical
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) return;
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/alerts/mark-all-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'new_message': return '💬';
      case 'new_bid': return '🔔';
      case 'deadline': return '⏰';
      case 'status_change': return '📋';
      case 'win': return '🏆';
      case 'loss': return '❌';
      default: return '🔔';
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <header className="h-16 bg-bg-secondary/90 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-0.5">
            <span>BidFlow</span>
            <span className="w-1 h-1 rounded-full bg-primary/40" />
            <span className="text-primary/60">SaaS</span>
          </div>
          <h2 className="text-lg font-semibold text-text-primary tracking-tight">
            {getPageTitle()}
          </h2>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all"
        >
          {resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-danger text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-bg-secondary rounded-xl shadow-xl border border-border z-50 animate-fade-in overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-text-primary">Notificações</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {notifications.length > 0 ? (
                  notifications.map((notif, idx) => (
                    <div
                      key={notif.id || idx}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-bg-tertiary transition-colors cursor-pointer ${
                        !notif.is_read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <span className="text-lg mt-0.5 shrink-0">{getNotifIcon(notif.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!notif.is_read ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                          {notif.content || notif.type || 'Nova notificação'}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          {notif.created_at ? timeAgo(notif.created_at) : ''}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Bell size={32} className="text-text-muted opacity-30" />
                    <p className="text-sm text-text-muted">Nenhuma notificação</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-border px-4 py-2.5">
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/settings'); }}
                    className="w-full text-center text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    Ver todas as configurações de alertas
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-border" />

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-lg hover:bg-bg-tertiary transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-text-primary">{user.name || 'Usuário'}</div>
              <div className="text-xs text-text-secondary">{user.email || 'usuario@email.com'}</div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-secondary rounded-lg shadow-lg border border-border py-1 z-50 animate-fade-in">
              <button
                onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
              >
                Perfil
              </button>
              <button
                onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
              >
                Configurações
              </button>
              <div className="border-t border-border my-1" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


// Componente wrapper para layout autenticado (com Sidebar)
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getPageFromPath = (): Page => {
    const path = location.pathname;
    if (path === '/company') return 'company';
    if (path === '/users') return 'users';
    if (path === '/reports') return 'reports';
    if (path === '/sales-funnel') return 'sales-funnel';
    if (path === '/leads') return 'leads';
    if (path === '/clients') return 'clients';
    if (path === '/proposals') return 'proposals';
    if (path === '/ai-generator') return 'ai-generator';
    if (path === '/email-marketing') return 'email-marketing';
    if (path === '/agenda') return 'agenda';
    if (path === '/bidding-hub') return 'bidding-hub';
    if (path === '/bidding-search') return 'bidding-search';
    if (path === '/bidding-bulletin') return 'bidding-bulletin';
    if (path === '/bidding-manage') return 'bidding-manage';
    if (path === '/documents') return 'documents';
    if (path === '/legal-consultant') return 'legal-consultant';
    if (path === '/bid-analyst') return 'bid-analyst';
    if (path === '/chat-monitor') return 'chat-monitor';
    if (path === '/chat-monitor-settings') return 'chat-monitor-settings';
    if (path === '/market-analysis') return 'market-analysis';
    if (path === '/competitor-analysis') return 'competitor-analysis';
    if (path === '/bidding-radar') return 'bidding-radar';
    if (path === '/bidding-monitoring') return 'bidding-monitoring';
    if (path === '/bidding-funnel') return 'bidding-funnel';
    if (path === '/bidding-capture') return 'bidding-capture';
    if (path === '/auction-details') return 'auction-details';
    if (path === '/licenses') return 'licenses';
    if (path === '/consignment') return 'consignment';
    if (path === '/contracts') return 'contracts';
    if (path === '/inventory') return 'inventory';
    if (path === '/campaigns') return 'campaigns';
    if (path === '/tasks') return 'tasks';
    if (path === '/products') return 'products';
    if (path === '/accounts-payable-receivable') return 'accounts-payable-receivable';
    if (path === '/finance') return 'finance';
    if (path === '/admin') return 'admin';
    if (path === '/chatbot') return 'chatbot';
    if (path === '/conversations') return 'conversations';
    if (path === '/support') return 'support';
    if (path === '/settings') return 'settings';
    return 'dashboard';
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar
        activePage={getPageFromPath()}
        onNavigate={(page) => navigate(`/${page}`)}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}

// Layout do Dashboard - com Sidebar (página inicial)
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar
        activePage="dashboard"
        onNavigate={(page) => navigate(`/${page}`)}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública - Landing Page */}
        <Route path="/" element={
          (() => {
            const token = localStorage.getItem('api_token');
            if (!token) return <LandingPage />;
            
            try {
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              return user.is_superadmin ? <Navigate to="/master/dashboard" replace /> : <Navigate to="/dashboard" replace />;
            } catch {
              return <LandingPage />;
            }
          })()
        } />

        {/* Rota pública - Login */}
        <Route path="/login" element={<Login />} />

        {/* Rota de acesso negado */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Dashboard - Página inicial com Sidebar */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <TenantGuard>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </TenantGuard>
          </ProtectedRoute>
        } />

        <Route path="/company" element={
          <ProtectedRoute>
            <PermissionRoute module="admin" page="settings">
              <AuthenticatedLayout>
                <Company />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            <PermissionRoute module="admin" page="users">
              <AuthenticatedLayout>
                <UsersManagement />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <PermissionRoute module="admin" page="logs">
              <AuthenticatedLayout>
                <ReportsBIPage />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Comercial */}
        <Route path="/sales-funnel" element={
          <ProtectedRoute>
            <PermissionRoute module="commercial" page="sales-funnel">
              <AuthenticatedLayout>
                <SalesFunnel />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/leads" element={
          <ProtectedRoute>
            <PermissionRoute module="commercial" page="opportunities">
              <AuthenticatedLayout>
                <Leads />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/clients" element={
          <ProtectedRoute>
            <PermissionRoute module="commercial" page="contacts-pf">
              <AuthenticatedLayout>
                <Clients />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/proposals" element={
          <ProtectedRoute>
            <PermissionRoute module="commercial" page="proposals">
              <AuthenticatedLayout>
                <Proposals />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/email-marketing" element={
          <ProtectedRoute>
            <PermissionRoute module="marketing" page="campaigns">
              <AuthenticatedLayout>
                <EmailMarketing />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/agenda" element={
          <ProtectedRoute>
            <PermissionRoute module="commercial" page="agenda">
              <AuthenticatedLayout>
                <Agenda />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Licitações */}
        <Route path="/bidding-hub" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <BiddingHub />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-search" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <BiddingSearch />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-bulletin" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <BiddingBulletin />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-manage" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <ManageBiddings />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/documents" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <ManageDocuments />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/legal-consultant" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <LegalConsultant />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bid-analyst" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <BidAnalyst />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/chat-monitor" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <ChatMonitor />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/chat-monitor-settings" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <ChatMonitorSettings />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/market-analysis" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <MarketAnalysis />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/competitor-analysis" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <CompetitorAnalysis />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-radar" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <BiddingRadar />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-monitoring" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <BiddingMonitoring />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-funnel" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="funnel">
              <AuthenticatedLayout>
                <BiddingFunnel />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-capture" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <BiddingCapture />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/auction-details" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <AuctionDetails />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/ai-generator" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <AIGenerator />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Operacional */}
        <Route path="/licenses" element={
          <ProtectedRoute>
            <PermissionRoute module="admin" page="settings">
              <AuthenticatedLayout>
                <Licenses />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/consignment" element={
          <ProtectedRoute>
            <PermissionRoute module="inventory" page="consignments">
              <AuthenticatedLayout>
                <Consignment />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/contracts" element={
          <ProtectedRoute>
            <PermissionRoute module="financial" page="contracts">
              <AuthenticatedLayout>
                <Contracts />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Estoque */}
        <Route path="/products" element={
          <ProtectedRoute>
            <PermissionRoute module="commercial" page="products">
              <AuthenticatedLayout>
                <Products />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/inventory" element={
          <ProtectedRoute>
            <PermissionRoute module="inventory" page="inventory-page">
              <AuthenticatedLayout>
                <Inventory />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/campaigns" element={
          <ProtectedRoute>
            <PermissionRoute module="marketing" page="campaigns">
              <AuthenticatedLayout>
                <Campaigns />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/tasks" element={
          <ProtectedRoute>
            <PermissionRoute module="modules" page="tasks">
              <AuthenticatedLayout>
                <Tasks />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Financeiro */}
        <Route path="/accounts-payable-receivable" element={
          <ProtectedRoute>
            <PermissionRoute module="financial" page="accounts-payable">
              <AuthenticatedLayout>
                <AccountsPayableReceivable />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/finance" element={
          <ProtectedRoute>
            <PermissionRoute module="financial" page="financial-manager">
              <AuthenticatedLayout>
                <Finance />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Configurações */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <PermissionRoute module="admin" page="settings">
              <AuthenticatedLayout>
                <Admin />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/chatbot" element={
          <ProtectedRoute>
            <PermissionRoute module="modules" page="chatbot">
              <AuthenticatedLayout>
                <ChatbotBuilder />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/conversations" element={
          <ProtectedRoute>
            <PermissionRoute module="modules" page="conversations">
              <AuthenticatedLayout>
                <Conversations />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/support" element={
          <ProtectedRoute>
            <PermissionRoute module="modules" page="support-center">
              <AuthenticatedLayout>
                <Conversations />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <PermissionRoute module="modules" page="settings">
              <AuthenticatedLayout>
                <Settings />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Master Routes (Super Admin) */}
        <Route path="/master" element={
          <MasterGuard>
            <MasterLayout />
          </MasterGuard>
        }>
          <Route path="dashboard" element={<MasterDashboard />} />
          <Route path="tenants" element={<TenantList />} />
          <Route path="plans" element={<PlansManagement />} />
          <Route path="system-health" element={<SystemHealth />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Rota fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
