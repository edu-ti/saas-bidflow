import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

type Page = 'kanban' | 'dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('kanban');

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
      </div>
    </div>
  );
}

export default App;
