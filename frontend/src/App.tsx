import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, Suspense, lazy } from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import type { Page } from './components/Sidebar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import LandingPage from './pages/LandingPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import MasterGuard from './guards/MasterGuard';
import TenantGuard from './guards/TenantGuard';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Lazy loading para reduzir bundle inicial
const Leads = lazy(() => import('./components/leads/LeadsDashboard'));
const Clients = lazy(() => import('./components/Clients'));
const Products = lazy(() => import('./components/Products'));
const Agenda = lazy(() => import('./components/Agenda'));
const BiddingRadar = lazy(() => import('./components/BiddingRadar'));
const EmailMarketing = lazy(() => import('./components/EmailMarketing'));
const UsersManagement = lazy(() => import('./components/UsersManagement'));
const SalesFunnel = lazy(() => import('./components/SalesFunnel'));
const Proposals = lazy(() => import('./components/Proposals'));
const AIGenerator = lazy(() => import('./components/AIGenerator'));
const BiddingMonitoring = lazy(() => import('./components/BiddingMonitoring'));
const BiddingCapture = lazy(() => import('./components/BiddingCapture'));
const BiddingFunnel = lazy(() => import('./components/BiddingFunnel'));
const BiddingHub = lazy(() => import('./components/BiddingHub'));
const BiddingSearch = lazy(() => import('./components/BiddingSearch'));
const BiddingBulletin = lazy(() => import('./components/BiddingBulletin'));
const ManageBiddings = lazy(() => import('./components/ManageBiddings'));
const ManageDocuments = lazy(() => import('./components/ManageDocuments'));
const LegalConsultant = lazy(() => import('./components/LegalConsultant'));
const BidAnalyst = lazy(() => import('./components/BidAnalyst'));
const ChatMonitor = lazy(() => import('./components/ChatMonitor'));
const ChatMonitorSettings = lazy(() => import('./components/ChatMonitorSettings'));
const MarketAnalysis = lazy(() => import('./components/MarketAnalysis'));
const CompetitorAnalysis = lazy(() => import('./components/CompetitorAnalysis'));
const AuctionDetails = lazy(() => import('./components/AuctionDetails'));
const Licenses = lazy(() => import('./components/Licenses'));
const Consignment = lazy(() => import('./components/Consignment'));
const Contracts = lazy(() => import('./components/contracts/ContractsDashboard'));
const Inventory = lazy(() => import('./components/inventory/InventoryDashboard'));
const Campaigns = lazy(() => import('./components/Campaigns'));
const Tasks = lazy(() => import('./components/Tasks'));
const ReportsBIPage = lazy(() => import('./components/ReportsBIPage'));
const AccountsPayableReceivable = lazy(() => import('./components/AccountsPayableReceivable'));
const Finance = lazy(() => import('./components/financial/FinanceDashboard'));
const Admin = lazy(() => import('./components/Admin'));
const Company = lazy(() => import('./components/Company'));
const ChatbotBuilder = lazy(() => import('./components/ChatbotBuilder'));
const Conversations = lazy(() => import('./components/Conversations'));
const Settings = lazy(() => import('./components/Settings'));
const TaxCompliancePage = lazy(() => import('./components/TaxCompliancePage'));
const MasterLayout = lazy(() => import('./layouts/MasterLayout'));
const MasterDashboard = lazy(() => import('./components/master/MasterDashboard'));
const TenantList = lazy(() => import('./components/master/TenantList'));
const PlansManagement = lazy(() => import('./components/master/PlansManagement'));
const SystemHealth = lazy(() => import('./components/master/SystemHealth'));

// Loading fallback
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

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
    if (!module) return false;

    // 1. Restrição de plano: verificar se o módulo está no plano (aplica a TODOS exceto superadmin)
    const allowedModules = user.allowed_modules || [];
    if (!user.is_superadmin && allowedModules.length > 0 && !allowedModules.includes(module)) {
      return false;
    }

    // 2. SuperAdmin ou Admin da empresa têm acesso a todos os módulos do plano
    if (user.is_superadmin || user.is_admin) return true;

    // 3. Se não há permissões detalhadas, permite se o módulo está no plano
    if (!user.permissions || !page) {
      return allowedModules.includes(module);
    }
    
    // 4. Suporte ao formato antigo (fallback) se necessário, mas focado no novo
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
      '/tax-compliance': 'Compliance Fiscal',
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

  // Buscar notificações só quando abre o menu, não fica fazendo polling
  React.useEffect(() => {
    if (showNotifications && notifications.length === 0) {
      fetchNotifications();
    }
  }, [showNotifications, fetchNotifications]);

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

  React.useEffect(() => {
    const refreshUser = async () => {
      try {
        const res = await api.get('/api/user');
        const fresh = res.data;
        const storedStr = localStorage.getItem('user');
        const stored = storedStr ? JSON.parse(storedStr) : {};
        const freshModules = (fresh.allowed_modules || []).sort().join(',');
        const storedModules = (stored.allowed_modules || []).sort().join(',');

        if (freshModules !== storedModules) {
          localStorage.setItem('user', JSON.stringify(fresh));
          window.location.reload();
        }
      } catch {}
    };
    refreshUser();
  }, [location.pathname]);

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
    if (path === '/tax-compliance') return 'tax-compliance';
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
            <PermissionRoute module="management" page="company">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Company /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            <PermissionRoute module="management" page="users-management">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><UsersManagement /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <PermissionRoute module="management" page="reports-dashboard">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><ReportsBIPage /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Comercial */}
        <Route path="/sales-funnel" element={
          <ProtectedRoute>
            <PermissionRoute module="commercial" page="sales-funnel">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><SalesFunnel /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/leads" element={
          <ProtectedRoute>
            <PermissionRoute module="commercial" page="leads">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Leads /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/clients" element={
          <ProtectedRoute>
            <PermissionRoute module="commercial" page="contacts-pf">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Clients /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/proposals" element={
          <ProtectedRoute>
            <PermissionRoute module="commercial" page="proposals">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Proposals /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/email-marketing" element={
          <ProtectedRoute>
            <PermissionRoute module="modules" page="email-marketing">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><EmailMarketing /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/agenda" element={
          <ProtectedRoute>
            <PermissionRoute module="commercial" page="agenda">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Agenda /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Licitações */}
        <Route path="/bidding-hub" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="bidding-manager">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><BiddingHub /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-search" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="search-bids">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><BiddingSearch /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-bulletin" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="bulletins">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><BiddingBulletin /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-manage" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="manage-bids">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><ManageBiddings /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/documents" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="documents">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><ManageDocuments /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/legal-consultant" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="legal-consultant">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><LegalConsultant /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bid-analyst" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="bid-analyst">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><BidAnalyst /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/chat-monitor" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="chat-monitor">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><ChatMonitor /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/chat-monitor-settings" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="chat-monitor">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><ChatMonitorSettings /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/market-analysis" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="market-analysis">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><MarketAnalysis /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/competitor-analysis" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="competitors">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><CompetitorAnalysis /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-radar" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="radar">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><BiddingRadar /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-monitoring" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="monitoring">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><BiddingMonitoring /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-funnel" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="bidding-funnel">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><BiddingFunnel /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-capture" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="capture">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><BiddingCapture /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/auction-details" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="auction-details">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><AuctionDetails /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/ai-generator" element={
          <ProtectedRoute>
            <PermissionRoute module="bidding" page="ai-generator">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><AIGenerator /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Operacional */}
        <Route path="/licenses" element={
          <ProtectedRoute>
            <PermissionRoute module="management" page="licenses">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Licenses /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/consignment" element={
          <ProtectedRoute>
            <PermissionRoute module="inventory" page="consignments">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Consignment /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/contracts" element={
          <ProtectedRoute>
            <PermissionRoute module="financial" page="contracts">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Contracts /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Estoque */}
        <Route path="/products" element={
          <ProtectedRoute>
            <PermissionRoute module="commercial" page="products">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Products /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/inventory" element={
          <ProtectedRoute>
            <PermissionRoute module="inventory" page="inventory-page">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Inventory /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/campaigns" element={
          <ProtectedRoute>
            <PermissionRoute module="modules" page="campaigns">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Campaigns /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/tasks" element={
          <ProtectedRoute>
            <PermissionRoute module="modules" page="tasks">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Tasks /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Financeiro */}
        <Route path="/accounts-payable-receivable" element={
          <ProtectedRoute>
            <PermissionRoute module="financial" page="accounts-payable">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><AccountsPayableReceivable /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/finance" element={
          <ProtectedRoute>
            <PermissionRoute module="financial" page="financial-manager">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Finance /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/tax-compliance" element={
          <ProtectedRoute>
            <PermissionRoute module="financial" page="tax-settings">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><TaxCompliancePage /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Configurações */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <PermissionRoute module="modules" page="settings-admin">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Admin /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/chatbot" element={
          <ProtectedRoute>
            <PermissionRoute module="modules" page="chatbot">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><ChatbotBuilder /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/conversations" element={
          <ProtectedRoute>
            <PermissionRoute module="modules" page="conversations">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Conversations /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/support" element={
          <ProtectedRoute>
            <PermissionRoute module="modules" page="support-center">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Conversations /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <PermissionRoute module="modules" page="settings">
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}><Settings /></Suspense>
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Master Routes (Super Admin) */}
        <Route path="/master" element={
          <MasterGuard>
            <Suspense fallback={<PageLoader />}><MasterLayout /></Suspense>
          </MasterGuard>
        }>
          <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><MasterDashboard /></Suspense>} />
          <Route path="tenants" element={<Suspense fallback={<PageLoader />}><TenantList /></Suspense>} />
          <Route path="plans" element={<Suspense fallback={<PageLoader />}><PlansManagement /></Suspense>} />
          <Route path="system-health" element={<Suspense fallback={<PageLoader />}><SystemHealth /></Suspense>} />
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
