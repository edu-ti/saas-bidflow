import { useState, useEffect } from 'react';
import { LayoutDashboard, KanbanSquare, Building2, FileText, Settings, LogOut, Bell } from 'lucide-react';
import api from '../lib/axios';

export default function Sidebar() {
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);
  const [userName, setUserName] = useState("Vendedor");
  const [companyName, setCompanyName] = useState("BidFlow Corp");

  // Simulating an interval to poll unread alerts + user context
  useEffect(() => {
    // Ideally user/company name is grabbed from an Auth Context or Redux store
    // For now we simulate polling the unread alerts
    
    const fetchAlerts = () => {
      // In a real scenario you'd have an endpoint count
      api.get('/api/alerts?unread=1')
        .then(res => {
          // just an example count
          if (res.data && res.data.length) {
             setUnreadAlerts(res.data.length);
          }
        })
        .catch(() => {});
    };

    fetchAlerts(); // initial load
    const interval = setInterval(fetchAlerts, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, active: false },
    { name: 'Kanban', icon: <KanbanSquare size={20} />, active: true, badge: unreadAlerts > 0 ? unreadAlerts : null },
    { name: 'Organizações', icon: <Building2 size={20} />, active: false },
    { name: 'Contratos', icon: <FileText size={20} />, active: false },
    { name: 'Configurações', icon: <Settings size={20} />, active: false },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 flex flex-col text-slate-300">
      <div className="p-6 pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <span className="text-blue-500 mr-2">●</span> BidFlow
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">ERP SaaS</p>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              item.active 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
            {item.badge && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 mt-auto bg-slate-950/30">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{companyName}</p>
          </div>
        </div>
        <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
          <LogOut size={18} className="mr-3" />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
}
