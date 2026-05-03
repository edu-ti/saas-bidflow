import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
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
import AuctionDetails from './components/AuctionDetails';
import Licenses from './components/Licenses';
import Consignment from './components/Consignment';
import Contracts from './components/contracts/ContractsDashboard';
import Inventory from './components/inventory/InventoryDashboard';
import Campaigns from './components/Campaigns';
import Tasks from './components/Tasks';
import Reports from './components/Reports';
import ReportsDashboard from './components/ReportsDashboard';
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

// Helper para verificar permissão no frontend
const hasPermission = (permission?: string, action: string = 'view') => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return false;
  
  try {
    const user = JSON.parse(storedUser);
    if (user.is_superadmin || user.is_admin || !user.role_id) return true;
    if (!user.permissions || !permission) return true; 
    return user.permissions[permission]?.[action] === true;
  } catch {
    return false;
  }
};

// Componente para rotas com permissão específica
function PermissionRoute({ children, permission }: { children: React.ReactNode, permission: string }) {
  if (!hasPermission(permission, 'view')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

// Componente Topbar
function Topbar({ title }: { title?: string }) {
  const location = useLocation();
  
  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    const titles: Record<string, string> = {
      '/': 'Dashboard Estratégico',
      '/dashboard': 'Dashboard Estratégico',
      '/company': 'Unidade de Negócio',
      '/users': 'Equipe / Utilizadores',
      '/reports': 'Relatórios & BI',
      '/reports-dashboard': 'BI Inteligente',
      '/sales-funnel': 'Funil de Vendas',
      '/leads': 'Gestão de Leads',
      '/clients': 'Base de Clientes',
      '/products': 'Catálogo de Produtos',
      '/proposals': 'Propostas de Valor',
      '/agenda': 'Agenda Integrada',
      '/bidding-funnel': 'Funil de Licitações',
      '/bidding-radar': 'Radar de Licitações',
      '/bidding-monitoring': 'Monitoramento Ativo',
      '/bidding-capture': 'Captação de Editais',
      '/auction-details': 'Detalhes do Pregão',
      '/ai-generator': 'Gerador IA',
      '/licenses': 'Licenças e Certidões',
      '/consignment': 'Gestão de Consignação',
      '/contracts': 'Contratos (CLM)',
      '/inventory': 'Inventário',
      '/campaigns': 'Marketing / Campanhas',
      '/tasks': 'Plano de Ação',
      '/finance': 'Motor Financeiro',
      '/accounts-payable-receivable': 'Contas a Pagar / Receber',
      '/chatbot': 'Construtor de Chatbot',
      '/conversations': 'Central de Atendimento',
      '/admin': 'Configurações da Empresa',
      '/settings': 'Preferências do Sistema',
    };
    return titles[path] || 'Dashboard';
  };

  return (
    <div className="h-20 bg-background/80 backdrop-blur-xl border-b border-border-subtle flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">
            <span>Main</span>
            <span className="w-1 h-1 rounded-full bg-primary/40" />
            <span className="text-primary/60 italic lowercase">v2.0 Platinum</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            {getPageTitle()}
            <span className="w-px h-4 bg-border-medium mx-1" />
          </h2>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Acesso Seguro</span>
          <span className="text-xs text-text-secondary font-medium">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="w-px h-8 bg-border-subtle" />
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-amber-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <button className="relative p-2 bg-surface rounded-full border border-border-subtle text-text-muted hover:text-text-primary transition-colors">
            <Activity size={18} />
          </button>
        </div>
      </div>
    </div>
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
    if (path === '/reports-dashboard') return 'reports-dashboard';
    if (path === '/sales-funnel') return 'sales-funnel';
    if (path === '/leads') return 'leads';
    if (path === '/clients') return 'clients';
    if (path === '/proposals') return 'proposals';
    if (path === '/ai-generator') return 'ai-generator';
    if (path === '/email-marketing') return 'email-marketing';
    if (path === '/agenda') return 'agenda';
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
    return 'dashboard';
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      <Sidebar
        activePage={getPageFromPath()}
        onNavigate={(page) => navigate(`/${page === 'dashboard' ? '' : page}`)}
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
    <div className="min-h-screen flex overflow-hidden bg-background">
      <Sidebar
        activePage="dashboard"
        onNavigate={(page) => navigate(`/${page === 'dashboard' ? '' : page}`)}
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

        {/* Dashboard - Página inicial com Sidebar */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/company" element={
          <ProtectedRoute>
            <PermissionRoute permission="admin">
              <AuthenticatedLayout>
                <Company />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            <PermissionRoute permission="users">
              <AuthenticatedLayout>
                <UsersManagement />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <PermissionRoute permission="reports">
              <AuthenticatedLayout>
                <Reports />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/reports-dashboard" element={
          <ProtectedRoute>
            <PermissionRoute permission="reports">
              <AuthenticatedLayout>
                <ReportsDashboard />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Comercial */}
        <Route path="/sales-funnel" element={
          <ProtectedRoute>
            <PermissionRoute permission="sales_funnel">
              <AuthenticatedLayout>
                <SalesFunnel />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/leads" element={
          <ProtectedRoute>
            <PermissionRoute permission="leads">
              <AuthenticatedLayout>
                <Leads />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/clients" element={
          <ProtectedRoute>
            <PermissionRoute permission="clients">
              <AuthenticatedLayout>
                <Clients />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/proposals" element={
          <ProtectedRoute>
            <PermissionRoute permission="proposals">
              <AuthenticatedLayout>
                <Proposals />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/email-marketing" element={
          <ProtectedRoute>
            <PermissionRoute permission="marketing">
              <AuthenticatedLayout>
                <EmailMarketing />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/agenda" element={
          <ProtectedRoute>
            <PermissionRoute permission="leads">
              <AuthenticatedLayout>
                <Agenda />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Licitações */}
        <Route path="/bidding-radar" element={
          <ProtectedRoute>
            <PermissionRoute permission="bidding_radar">
              <AuthenticatedLayout>
                <BiddingRadar />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-monitoring" element={
          <ProtectedRoute>
            <PermissionRoute permission="bidding_radar">
              <AuthenticatedLayout>
                <BiddingMonitoring />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-funnel" element={
          <ProtectedRoute>
            <PermissionRoute permission="bidding_funnel">
              <AuthenticatedLayout>
                <BiddingFunnel />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/bidding-capture" element={
          <ProtectedRoute>
            <PermissionRoute permission="bidding_capture">
              <AuthenticatedLayout>
                <BiddingCapture />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/auction-details" element={
          <ProtectedRoute>
            <PermissionRoute permission="bidding_radar">
              <AuthenticatedLayout>
                <AuctionDetails />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/ai-generator" element={
          <ProtectedRoute>
            <PermissionRoute permission="bidding_radar">
              <AuthenticatedLayout>
                <AIGenerator />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Operacional */}
        <Route path="/licenses" element={
          <ProtectedRoute>
            <PermissionRoute permission="admin">
              <AuthenticatedLayout>
                <Licenses />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/consignment" element={
          <ProtectedRoute>
            <PermissionRoute permission="inventory">
              <AuthenticatedLayout>
                <Consignment />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/contracts" element={
          <ProtectedRoute>
            <PermissionRoute permission="contracts">
              <AuthenticatedLayout>
                <Contracts />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Estoque */}
        <Route path="/products" element={
          <ProtectedRoute>
            <PermissionRoute permission="inventory">
              <AuthenticatedLayout>
                <Products />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/inventory" element={
          <ProtectedRoute>
            <PermissionRoute permission="inventory">
              <AuthenticatedLayout>
                <Inventory />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/campaigns" element={
          <ProtectedRoute>
            <PermissionRoute permission="marketing">
              <AuthenticatedLayout>
                <Campaigns />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/tasks" element={
          <ProtectedRoute>
            <PermissionRoute permission="dashboard">
              <AuthenticatedLayout>
                <Tasks />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Financeiro */}
        <Route path="/accounts-payable-receivable" element={
          <ProtectedRoute>
            <PermissionRoute permission="accounts">
              <AuthenticatedLayout>
                <AccountsPayableReceivable />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/finance" element={
          <ProtectedRoute>
            <PermissionRoute permission="finance">
              <AuthenticatedLayout>
                <Finance />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Configurações */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <PermissionRoute permission="admin">
              <AuthenticatedLayout>
                <Admin />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/chatbot" element={
          <ProtectedRoute>
            <PermissionRoute permission="chatbot">
              <AuthenticatedLayout>
                <ChatbotBuilder />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/conversations" element={
          <ProtectedRoute>
            <PermissionRoute permission="chatbot">
              <AuthenticatedLayout>
                <Conversations />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <PermissionRoute permission="dashboard">
              <AuthenticatedLayout>
                <Settings />
              </AuthenticatedLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        {/* Master Routes (Super Admin) */}
        <Route path="/master" element={
          <SuperAdminRoute>
            <MasterLayout />
          </SuperAdminRoute>
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
