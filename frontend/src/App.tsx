import { useState, useEffect } from 'react';
import Sidebar, { type Page } from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Leads from './components/Leads';
import Contacts from './components/Contacts';
import IndividualClients from './components/IndividualClients';
import Products from './components/Products';
import Agenda from './components/Agenda';
import BiddingRadar from './components/BiddingRadar';
import Finance from './components/Finance';
import EmailMarketing from './components/EmailMarketing';
import CompanySettings from './components/CompanySettings';
import UsersManagement from './components/UsersManagement';
import AIProposalDraft from './components/AIProposalDraft';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('api_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar activePage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} />
      <div className="flex-1 overflow-auto h-screen">
        {currentPage === 'kanban' && <KanbanBoard />}
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'leads' && <Leads />}
        {currentPage === 'contacts' && <Contacts />}
        {currentPage === 'individual-clients' && <IndividualClients />}
        {currentPage === 'products' && <Products />}
        {currentPage === 'agenda' && <Agenda />}
        {currentPage === 'bidding-radar' && <BiddingRadar />}
        {currentPage === 'finance' && <Finance />}
        {currentPage === 'email-marketing' && <EmailMarketing />}
        {currentPage === 'company-settings' && <CompanySettings />}
        {currentPage === 'users-management' && <UsersManagement />}
        {currentPage === 'ai-proposal-draft' && <AIProposalDraft />}
      </div>
    </div>
  );
}

export default App;
