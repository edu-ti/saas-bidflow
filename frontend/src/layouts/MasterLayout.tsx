import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Building2, LogOut, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MasterLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { key: '/master/dashboard', name: 'Dashboard Master', icon: <LayoutDashboard size={18} /> },
    { key: '/master/tenants', name: 'Gestão de Empresas', icon: <Building2 size={18} /> },
    { key: '/master/plans', name: 'Planos de Assinatura', icon: <Building2 size={18} /> },
  ];

  return (
    <div className={`min-h-screen flex overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <aside className={`w-64 flex-shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r flex flex-col transition-all duration-300 z-20`}>
        <div className={`h-16 flex items-center px-4 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} border-b`}>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Shield size={24} className="text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-lg text-slate-800 dark:text-slate-100">BidFlow Master</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => navigate(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname.startsWith(item.key)
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className={location.pathname.startsWith(item.key) ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-medium">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">Super Admin</p>
              <p className="text-xs text-slate-500 truncate">master@bidflow.com</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto h-screen relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
