import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Leads from './components/Leads';
import Contacts from './components/Contacts';
import IndividualClients from './components/IndividualClients';
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
import AuctionDetails from './components/AuctionDetails';
import Licenses from './components/Licenses';
import Consignment from './components/Consignment';
import Contracts from './components/Contracts';
import Reports from './components/Reports';
import AccountsPayableReceivable from './components/AccountsPayableReceivable';
import Admin from './components/Admin';
import Company from './components/Company';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Componente para rotas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('api_token');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
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

  // Mapear pathname para page do Sidebar
  const getPageFromPath = (): string => {
    const path = location.pathname;
    // Gestão
    if (path === '/company') return 'company';
    if (path === '/users') return 'users';
    if (path === '/reports') return 'reports';
    // Comercial
    if (path === '/sales-funnel') return 'sales-funnel';
    if (path === '/leads') return 'leads';
    if (path === '/contacts') return 'contacts';
    if (path === '/individual-clients') return 'individual-clients';
    if (path === '/proposals') return 'proposals';
    if (path === '/ai-generator') return 'ai-generator';
    if (path === '/email-marketing') return 'email-marketing';
    if (path === '/agenda') return 'agenda';
    // Licitações
    if (path === '/bidding-radar') return 'bidding-radar';
    if (path === '/bidding-monitoring') return 'bidding-monitoring';
    if (path === '/bidding-capture') return 'bidding-capture';
    if (path === '/auction-details') return 'auction-details';
    // Operacional
    if (path === '/licenses') return 'licenses';
    if (path === '/consignment') return 'consignment';
    if (path === '/contracts') return 'contracts';
    // Estoque
    if (path === '/products') return 'products';
    // Financeiro
    if (path === '/accounts-payable-receivable') return 'accounts-payable-receivable';
    // Configurações
    if (path === '/admin') return 'admin';
    return 'dashboard';
  };

  return (
    <div className={`min-h-screen flex overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <Sidebar
        activePage={getPageFromPath()}
        onNavigate={(page) => navigate(`/${page === 'dashboard' ? '' : page}`)}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-auto h-screen">
        {children}
      </div>
    </div>
  );
}

// Layout do Dashboard - com Sidebar (página inicial)
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={`min-h-screen flex overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <Sidebar
        activePage="dashboard"
        onNavigate={(page) => navigate(`/${page === 'dashboard' ? '' : page}`)}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-auto h-screen">
        {children}
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública - Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard - Página inicial com Sidebar */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/company" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Company />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <UsersManagement />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Reports />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Comercial */}
        <Route path="/sales-funnel" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <SalesFunnel />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/leads" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Leads />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/contacts" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Contacts />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/individual-clients" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <IndividualClients />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/proposals" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Proposals />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/ai-generator" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <AIGenerator />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/email-marketing" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <EmailMarketing />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/agenda" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Agenda />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Licitações */}
        <Route path="/bidding-radar" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <BiddingRadar />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/bidding-monitoring" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <BiddingMonitoring />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/bidding-capture" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <BiddingCapture />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/auction-details" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <AuctionDetails />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Operacional */}
        <Route path="/licenses" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Licenses />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/consignment" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Consignment />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/contracts" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Contracts />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Estoque */}
        <Route path="/products" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Products />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Financeiro */}
        <Route path="/accounts-payable-receivable" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <AccountsPayableReceivable />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        {/* Rotas protegidas - Configurações */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Admin />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

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
