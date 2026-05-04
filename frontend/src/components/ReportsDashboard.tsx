import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, FunnelChart, Funnel, LabelList, AreaChart, Area
} from 'recharts';
import {
  LayoutDashboard, Target, Wallet, TrendingUp, TrendingDown, DollarSign,
  Award, Calendar, Users, Filter, ShieldCheck, Zap, BarChart3, ChevronRight, Lock, Loader2, FileText, Clock, FileBarChart, PieChart as PieChartIcon, 
  MapPin, Truck, Settings, Download, FileJson, FileSpreadsheet
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import GoalSettingsModal from './GoalSettingsModal';

type TabType = 'overview' | 'bidding' | 'sales' | 'suppliers' | 'team';

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [userId, setUserId] = useState<number | null>(null);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [uf, setUf] = useState<string>('');
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const [data, setData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const months = [
    { id: 1, name: 'Janeiro' }, { id: 2, name: 'Fevereiro' }, { id: 3, name: 'Março' },
    { id: 4, name: 'Abril' }, { id: 5, name: 'Maio' }, { id: 6, name: 'Junho' },
    { id: 7, name: 'Julho' }, { id: 8, name: 'Agosto' }, { id: 9, name: 'Setembro' },
    { id: 10, name: 'Outubro' }, { id: 11, name: 'Novembro' }, { id: 12, name: 'Dezembro' }
  ];

  const years = [2024, 2025, 2026];
  const ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  useEffect(() => {
    api.get('/api/reports/users').then(res => setUsers(res.data)).catch(() => {});
    api.get('/api/reports/available-suppliers').then(res => setSuppliers(res.data)).catch(() => {});
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { month, year, user_id: userId, supplier_id: supplierId, uf };
      let endpoint = '';
      
      switch(activeTab) {
        case 'overview': endpoint = '/api/reports/overview'; break;
        case 'bidding': endpoint = '/api/reports/bidding'; break;
        case 'sales': endpoint = '/api/reports/sales'; break;
        case 'suppliers': endpoint = '/api/reports/suppliers'; break;
        case 'team': endpoint = '/api/reports/team-performance'; break;
      }

      const res = await api.get(endpoint, { params });
      setData(res.data);
    } catch (error) {
      toast.error('Erro ao carregar dados do BI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, month, year, userId, supplierId, uf]);

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const handleExport = async (type: 'pdf' | 'excel') => {
    const loadingToast = toast.loading(`Exportando Visão ${activeTab.toUpperCase()} para ${type.toUpperCase()}...`);
    try {
      const params = new URLSearchParams({
        type,
        tab: activeTab,
        month: month.toString(),
        year: year.toString(),
      });
      if (userId) params.append('user_id', userId.toString());
      if (supplierId) params.append('supplier_id', supplierId.toString());
      if (uf) params.append('uf', uf);

      const response = await api.get(`/api/reports/export?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_${activeTab}_${month}_${year}.${type === 'pdf' ? 'pdf' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      toast.success('Arquivo exportado com sucesso!', { id: loadingToast });
    } catch (error) {
      toast.error('Erro ao exportar arquivo', { id: loadingToast });
    }
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700 overflow-x-hidden pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            BI Inteligente & <span className="text-gradient-gold">Data Analytics</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <BarChart3 size={14} className="text-primary" />
            Visão Multidimensional de Performance, Metas e Estratégia Platinum.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-3 px-6 py-3.5 bg-surface-elevated/40 text-text-primary font-black rounded-2xl border border-border-subtle hover:bg-surface-elevated transition-all text-[10px] uppercase tracking-widest shadow-platinum-glow-sm"
          >
            <Settings size={16} className="text-primary" />
            Configurar Metas
          </button>

          <div className="relative group">
            <button className="btn-primary py-3.5 px-8 text-[10px] tracking-widest shadow-platinum-glow flex items-center gap-3">
              <Download size={16} />
              Exportar
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-surface-elevated border border-border-subtle rounded-2xl shadow-platinum-glow-sm overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button onClick={() => handleExport('pdf')} className="w-full px-6 py-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-colors border-b border-border-subtle">
                <FileText size={16} />
                PDF (Resumo)
              </button>
              <button onClick={() => handleExport('excel')} className="w-full px-6 py-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors">
                <FileSpreadsheet size={16} />
                Excel (Dados)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Filter Bar */}
      <div className="platinum-card p-8 flex flex-wrap items-center gap-10 bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 shadow-inner-platinum">
        <div className="flex items-center gap-4 group">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-platinum-glow-sm group-hover:scale-110 transition-transform">
             <Calendar size={20} />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-60">Mês</span>
               <select value={month} onChange={e => setMonth(Number(e.target.value))} className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] text-text-primary outline-none cursor-pointer">
                 {months.map(m => <option key={m.id} value={m.id} className="bg-surface">{m.name}</option>)}
               </select>
            </div>
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-60">Ano</span>
               <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] text-text-primary outline-none cursor-pointer">
                 {years.map(y => <option key={y} value={y} className="bg-surface">{y}</option>)}
               </select>
            </div>
          </div>
        </div>

        <div className="w-px h-10 bg-border-subtle/30" />

        <div className="flex items-center gap-4 group">
          <div className="p-3 bg-secondary/10 rounded-2xl text-secondary shadow-platinum-glow-sm group-hover:scale-110 transition-transform">
             <Users size={20} />
          </div>
          <div className="flex flex-col">
             <span className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-60">Vendedor / Responsável</span>
             <select value={userId || ''} onChange={e => setUserId(e.target.value ? Number(e.target.value) : null)} className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] text-text-primary outline-none cursor-pointer">
               <option value="" className="bg-surface">Todos os Vendedores</option>
               {users.map(u => <option key={u.id} value={u.id} className="bg-surface">{u.name}</option>)}
             </select>
          </div>
        </div>

        <div className="w-px h-10 bg-border-subtle/30" />

        <div className="flex items-center gap-4 group">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 shadow-platinum-glow-sm group-hover:scale-110 transition-transform">
             <Truck size={20} />
          </div>
          <div className="flex flex-col">
             <span className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-60">Fornecedor</span>
             <select value={supplierId || ''} onChange={e => setSupplierId(e.target.value ? Number(e.target.value) : null)} className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] text-text-primary outline-none cursor-pointer">
               <option value="" className="bg-surface">Todos os Fornecedores</option>
               {suppliers.map(s => <option key={s.id} value={s.id} className="bg-surface">{s.name}</option>)}
             </select>
          </div>
        </div>

        <div className="w-px h-10 bg-border-subtle/30" />

        <div className="flex items-center gap-4 group">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-platinum-glow-sm group-hover:scale-110 transition-transform">
             <MapPin size={20} />
          </div>
          <div className="flex flex-col">
             <span className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-60">Estado (UF)</span>
             <select value={uf} onChange={e => setUf(e.target.value)} className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] text-text-primary outline-none cursor-pointer">
               <option value="" className="bg-surface">Brasil (Todos)</option>
               {ufs.map(u => <option key={u} value={u} className="bg-surface">{u}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <nav className="flex items-center gap-4 bg-surface-elevated/20 border border-border-subtle p-2.5 rounded-[2.5rem] w-fit shadow-platinum-glow-sm backdrop-blur-md">
        {[
          { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
          { id: 'bidding', label: 'Licitações', icon: Target },
          { id: 'sales', label: 'Vendas', icon: DollarSign },
          { id: 'suppliers', label: 'Fornecedores', icon: Truck },
          { id: 'team', label: 'Equipe', icon: Users }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
              activeTab === tab.id 
                ? 'bg-primary text-background shadow-platinum-glow' 
                : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/50'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-8 animate-pulse">
           <Loader2 className="w-16 h-16 animate-spin text-primary opacity-40" />
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted">Processando Dimensões...</span>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Overview Section */}
          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'Faturamento Realizado', val: formatCurrency(data?.revenue), target: formatCurrency(data?.target_revenue), progress: data?.revenue_progress, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { label: 'Contratos / Vitórias', val: data?.won_opportunities || 0, target: data?.target_wins || 0, progress: data?.wins_progress, icon: Award, color: 'text-primary', bg: 'bg-primary/10' },
                  { label: 'Win Rate Global', val: `${(data?.win_rate || 0).toFixed(1)}%`, target: '70%', progress: (data?.win_rate || 0) / 0.7, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Oportunidades Ativas', val: data?.total_opportunities || 0, target: '100', progress: (data?.total_opportunities || 0), icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((kpi, i) => (
                  <div key={i} className="platinum-card p-8 flex flex-col gap-6 bg-surface-elevated/10 group hover:border-primary/30 transition-all duration-500">
                    <div className="flex justify-between items-start">
                      <div className={`w-14 h-14 rounded-2xl ${kpi.bg} border border-border-subtle flex items-center justify-center shadow-platinum-glow-sm group-hover:scale-110 transition-transform`}>
                        <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">Meta: {kpi.target}</span>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <TrendingUp size={12} className={kpi.progress >= 100 ? 'text-emerald-500' : 'text-amber-500'} />
                          <span className={`text-xs font-black ${kpi.progress >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>{kpi.progress}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-60">{kpi.label}</p>
                      <p className="text-2xl font-black text-text-primary mt-2 tracking-tighter">{kpi.val}</p>
                    </div>
                    <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden border border-border-subtle/30 shadow-inner">
                       <div 
                         className={`h-full transition-all duration-1000 ${kpi.progress >= 100 ? 'bg-emerald-500 shadow-emerald-500/50 shadow-lg' : 'bg-primary'}`} 
                         style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                       />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bidding Section */}
          {activeTab === 'bidding' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 platinum-card p-10 bg-surface-elevated/10 space-y-8">
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                    <PieChartIcon size={16} className="text-primary" />
                    Distribuição de Risco Licitatório
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Ganhas', value: data?.won || 0 },
                            { name: 'Perdidas', value: data?.lost || 0 },
                            { name: 'Em Aberto', value: (data?.total || 0) - (data?.won || 0) - (data?.lost || 0) }
                          ]}
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={10}
                          dataKey="value"
                        >
                          <Cell fill="var(--color-primary)" />
                          <Cell fill="#ef4444" />
                          <Cell fill="var(--color-surface-elevated)" stroke="var(--color-border-subtle)" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface-elevated)', border: 'none', borderRadius: '12px' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="platinum-card p-10 bg-surface-elevated/10 space-y-8">
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                    <TrendingDown size={16} className="text-red-500" />
                    Motivos de Perda (Loss Analysis)
                  </h3>
                  <div className="space-y-6">
                    {(data?.loss_analysis || []).length > 0 ? (data?.loss_analysis || []).map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-surface-elevated/20 rounded-2xl border border-border-subtle group hover:border-red-500/30 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{item.loss_reason || 'Outros'}</span>
                        <div className="flex items-center gap-4">
                           <span className="text-sm font-black text-text-primary">{item.count}</span>
                           <div className="w-16 h-2 bg-background/50 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500" style={{ width: `${Math.min((item.count/data?.total)*100, 100)}%` }} />
                           </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center opacity-30 italic text-[10px] uppercase font-black tracking-widest">Nenhuma perda registrada</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Suppliers Section */}
          {activeTab === 'suppliers' && (
            <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-inner-platinum">
               <div className="p-8 border-b border-border-subtle/30 flex items-center justify-between bg-surface-elevated/10">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 shadow-platinum-glow-sm">
                     <Truck size={20} />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-primary">Ranking de Performance por Fornecedor</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-elevated/40 border-b border-border-subtle">
                      <th className="px-10 py-6 text-[9px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Fornecedor</th>
                      <th className="px-10 py-6 text-[9px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60 text-center">Total Oportunidades</th>
                      <th className="px-10 py-6 text-[9px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60 text-center">Vitórias</th>
                      <th className="px-10 py-6 text-[9px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60 text-right">Faturamento Realizado</th>
                      <th className="px-10 py-6 text-[9px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60 text-center">Eficiência</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/20">
                    {data && Array.isArray(data) && data.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/10">
                        <td className="px-10 py-8 font-black text-[11px] text-text-primary uppercase tracking-tight">{item.supplier_name}</td>
                        <td className="px-10 py-8 text-center text-xs font-black text-text-secondary">{item.total_opps}</td>
                        <td className="px-10 py-8 text-center text-xs font-black text-emerald-500">{item.wins}</td>
                        <td className="px-10 py-8 text-right font-black text-xs text-text-primary">{formatCurrency(item.revenue)}</td>
                        <td className="px-10 py-8">
                          <div className="flex items-center justify-center gap-3">
                             <div className="w-24 h-1.5 bg-background/50 rounded-full overflow-hidden border border-border-subtle/30 shadow-inner">
                                <div className="h-full bg-primary" style={{ width: `${Math.min((item.wins/item.total_opps)*100, 100)}%` }} />
                             </div>
                             <span className="text-[10px] font-black text-primary">{( (item.wins/item.total_opps)*100 ).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Team Section */}
          {activeTab === 'team' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {data && Array.isArray(data) && data.map((user: any, i: number) => (
                 <div key={i} className="platinum-card p-10 bg-surface-elevated/10 space-y-8 group hover:border-primary/30 transition-all border-border-subtle/30">
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 rounded-full bg-surface-elevated border-2 border-border-subtle overflow-hidden p-1 shadow-platinum-glow-sm group-hover:scale-105 transition-transform">
                          <img src={`https://ui-avatars.com/api/?name=${user.user_name}&background=random`} alt={user.user_name} className="w-full h-full rounded-full" />
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-text-primary uppercase tracking-tight">{user.user_name}</h4>
                          <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Consultor Platinum</span>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-5 bg-background/30 rounded-2xl border border-border-subtle/40">
                          <p className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-60 mb-1">Vitórias</p>
                          <p className="text-xl font-black text-emerald-500">{user.won_count}</p>
                       </div>
                       <div className="p-5 bg-background/30 rounded-2xl border border-border-subtle/40">
                          <p className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-60 mb-1">Win Rate</p>
                          <p className="text-xl font-black text-primary">{user.win_rate}%</p>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-text-muted">Volume Total</span>
                          <span className="text-text-primary">{formatCurrency(user.won_value)}</span>
                       </div>
                       <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden border border-border-subtle/20">
                          <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.min(user.win_rate, 100)}%` }} />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      )}

      <GoalSettingsModal 
        isOpen={isGoalModalOpen} 
        onClose={() => {
          setIsGoalModalOpen(false);
          fetchData();
        }} 
      />
    </div>
  );
}
