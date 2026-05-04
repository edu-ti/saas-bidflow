import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, FunnelChart, Funnel, LabelList, AreaChart, Area
} from 'recharts';
import {
  LayoutDashboard, Target, Wallet, TrendingUp, TrendingDown, DollarSign,
  Award, Calendar, Users, Filter, ShieldCheck, Zap, BarChart3, ChevronRight, Lock, Loader2, FileText, Clock, FileBarChart, PieChart as PieChartIcon
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

type PeriodFilter = 'month' | '30days' | 'year' | 'custom';

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bidding' | 'financial'>('overview');
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [userId, setUserId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [overview, setOverview] = useState<any>(null);
  const [biddingMetrics, setBiddingMetrics] = useState<any>(null);
  const [biddingFunnel, setBiddingFunnel] = useState<any[]>([]);
  const [financialHealth, setFinancialHealth] = useState<any>(null);
  const [financialTimeline, setFinancialTimeline] = useState<any[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/reports/users').then(res => setUsers(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const params: any = { period };
        if (userId) params.user_id = userId;
        if (period === 'custom') { params.start_date = startDate; params.end_date = endDate; }

        const [ovRes, bidRes, finRes, teamRes] = await Promise.all([
          api.get('/api/reports/overview', { params }),
          api.get('/api/reports/bidding', { params }),
          api.get('/api/reports/financial', { params }),
          api.get('/api/reports/team-performance', { params }),
        ]);

        setOverview(ovRes.data);
        setBiddingMetrics(bidRes.data.metrics);
        setBiddingFunnel(bidRes.data.funnel);
        setFinancialHealth(finRes.data.health);
        setFinancialTimeline(finRes.data.timeline);
        setTeamPerformance(teamRes.data);
      } catch (error) { }
      finally { setLoading(false); }
    };
    fetchAllData();
  }, [period, userId, startDate, endDate]);

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const handleExportPDF = () => {
    toast.loading('Gerando Relatório PDF Platinum...', { duration: 2500 });
    setTimeout(() => {
      window.print();
      toast.success('Relatório PDF gerado com sucesso!');
    }, 2500);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-56 gap-8 animate-in fade-in duration-700">
      <div className="relative">
         <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
         <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted animate-pulse">Compilando Inteligência Global...</span>
    </div>
  );

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700 overflow-x-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            BI Inteligente & <span className="text-gradient-gold">Data Analytics</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <BarChart3 size={14} className="text-primary" />
            Consolidação estratégica de dados operacionais, financeiros e performance Platinum.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-surface-elevated/20 border border-border-subtle p-2.5 rounded-2xl shadow-platinum-glow-sm backdrop-blur-md">
          <button 
            onClick={handleExportPDF}
            className="btn-primary py-3 px-8 text-[10px] tracking-widest shadow-platinum-glow"
          >
            Exportar Relatório PDF
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="platinum-card p-6 flex flex-wrap items-center gap-8 bg-surface-elevated/10 backdrop-blur-xl">
        <div className="flex items-center gap-4 group">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-platinum-glow-sm group-hover:scale-110 transition-transform">
             <Calendar size={18} />
          </div>
          <div className="flex flex-col">
             <span className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-60">Período de Análise</span>
             <select 
               value={period} 
               onChange={e => setPeriod(e.target.value as any)}
               className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] text-text-primary outline-none cursor-pointer hover:text-primary transition-colors"
             >
               <option value="month" className="bg-surface font-bold text-text-primary">Este Mês Atual</option>
               <option value="30days" className="bg-surface font-bold text-text-primary">Últimos 30 dias</option>
               <option value="year" className="bg-surface font-bold text-text-primary">Este Ano Fiscal</option>
               <option value="custom" className="bg-surface font-bold text-text-primary">Data Personalizada</option>
             </select>
          </div>
        </div>
        
        <div className="hidden md:block w-px h-10 bg-border-subtle/50" />
        
        <div className="flex items-center gap-4 group">
          <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary shadow-platinum-glow-sm group-hover:scale-110 transition-transform">
             <Users size={18} />
          </div>
          <div className="flex flex-col">
             <span className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-60">Filtrar por Responsável</span>
             <select 
               value={userId || ''} 
               onChange={e => setUserId(e.target.value ? Number(e.target.value) : null)}
               className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] text-text-primary outline-none cursor-pointer hover:text-primary transition-colors"
             >
               <option value="" className="bg-surface font-bold text-text-primary">Estrutura Global (Todos)</option>
               {users.map(u => <option key={u.id} value={u.id} className="bg-surface font-bold text-text-primary">{u.name}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 bg-surface-elevated/20 border border-border-subtle p-2.5 rounded-[2.5rem] w-fit shadow-platinum-glow-sm backdrop-blur-md">
        {[
          { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
          { id: 'bidding', label: 'Licitações', icon: Target },
          { id: 'financial', label: 'Saúde Financeira', icon: Wallet }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
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
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Receita Líquida (MRR)', val: formatCurrency(overview?.revenue), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Win Rate Global', val: `${(overview?.win_rate || 0).toFixed(1)}%`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Contratos Ativos', val: overview?.new_contracts || 0, icon: Award, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Pipeline Oportunidades', val: overview?.total_opportunities || 0, icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            ].map((kpi, i) => (
              <div key={i} className="platinum-card p-8 flex flex-col gap-6 group hover:border-primary/30 transition-all duration-500 bg-surface-elevated/10">
                <div className={`w-14 h-14 rounded-2xl ${kpi.bg} border border-border-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-platinum-glow-sm`}>
                  <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-60">{kpi.label}</p>
                  <p className="text-2xl font-black text-text-primary mt-2 tracking-tighter">{kpi.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="platinum-card p-10 space-y-10 bg-surface-elevated/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                  <BarChart3 size={16} className="text-primary" />
                  Performance da Estrutura (Top Won)
                </h3>
                <ChevronRight size={14} className="text-text-muted opacity-40" />
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(teamPerformance || []).slice(0, 5)} layout="vertical" margin={{ left: 40, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" horizontal={false} opacity={0.3} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 800 }} tickFormatter={v => `R$${v/1000}k`} />
                    <YAxis dataKey="user_name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 800 }} />
                    <Tooltip cursor={{ fill: 'var(--color-surface-elevated)', opacity: 0.1 }} contentStyle={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', boxShadow: 'var(--platinum-glow)', color: 'var(--color-text-primary)', fontSize: '12px', fontWeight: 'bold' }} />
                    <Bar dataKey="won_value" fill="var(--color-primary)" radius={[0, 8, 8, 0]} barSize={24} shadow="var(--platinum-glow-sm)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="platinum-card p-10 space-y-10 bg-surface-elevated/10">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                <PieChartIcon size={16} className="text-primary" />
                Distribuição Operacional Platinum
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {[
                  { label: 'Taxa de Conversão Real', val: `${(overview?.win_rate || 0).toFixed(1)}%`, icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
                  { label: 'Volume em Negociação', val: formatCurrency((overview?.total_opportunities - (overview?.won_opportunities || 0)) * 5000), icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Success Ops (Won)', val: overview?.won_opportunities || 0, icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-surface-elevated/20 border border-border-subtle rounded-[2rem] group hover:bg-surface-elevated/40 transition-all duration-300 shadow-platinum-glow-sm">
                    <div className="flex items-center gap-5">
                      <div className={`p-3.5 ${item.bg} rounded-2xl ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon size={20} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted opacity-80">{item.label}</span>
                    </div>
                    <span className="text-xl font-black text-text-primary tracking-tighter">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bidding' && (
        <div className="space-y-10 animate-in slide-in-from-right-8 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Editais Capturados', val: biddingMetrics?.total || 0, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Win Rate Licitações', val: `${(biddingMetrics?.win_rate || 0).toFixed(1)}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Alertas IA BidFlow', val: biddingMetrics?.captured_alerts || 0, icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Valuation Vencido', val: formatCurrency(biddingMetrics?.won_value), icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            ].map((kpi, i) => (
              <div key={i} className="platinum-card p-8 flex flex-col gap-6 bg-surface-elevated/10">
                <div className={`w-14 h-14 rounded-2xl ${kpi.bg} border border-border-subtle flex items-center justify-center shadow-platinum-glow-sm`}>
                  <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-60">{kpi.label}</p>
                  <p className="text-2xl font-black text-text-primary mt-2 tracking-tighter">{kpi.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="platinum-card p-10 space-y-10 bg-surface-elevated/10">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.3em] flex items-center gap-3">
               <FileBarChart size={16} className="text-primary" />
               Fluxo de Funil Licitatório
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={biddingFunnel || []} margin={{ bottom: 30, top: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.3} />
                  <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 900 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 900 }} />
                  <Tooltip cursor={{ fill: 'var(--color-surface-elevated)', opacity: 0.1 }} contentStyle={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', boxShadow: 'var(--platinum-glow)', color: 'var(--color-text-primary)', fontWeight: 'bold' }} />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[10, 10, 0, 0]} barSize={50}>
                    <LabelList dataKey="count" position="top" fill="var(--color-text-primary)" style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '1px' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="space-y-10 animate-in slide-in-from-left-8 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Liquidez em Custódia', val: formatCurrency(financialHealth?.liquidity), icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Burn Rate Mensal', val: formatCurrency(financialHealth?.burn_rate), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-500/10' },
              { label: 'Runway Operacional', val: `${financialHealth?.runway || 0} Meses`, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Score Compliance', val: 'PLATINUM', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            ].map((kpi, i) => (
              <div key={i} className="platinum-card p-8 flex flex-col gap-6 bg-surface-elevated/10">
                <div className={`w-14 h-14 rounded-2xl ${kpi.bg} border border-border-subtle flex items-center justify-center shadow-platinum-glow-sm`}>
                  <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-60">{kpi.label}</p>
                  <p className="text-2xl font-black text-text-primary mt-2 tracking-tighter">{kpi.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="platinum-card p-10 space-y-10 bg-surface-elevated/10">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.3em] flex items-center gap-3">
              <TrendingUp size={16} className="text-primary" />
              Evolução e Fluxo de Caixa Platinum
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialTimeline || []} margin={{ bottom: 30 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.3} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 900 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 900 }} tickFormatter={v => `R$${v/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', boxShadow: 'var(--platinum-glow)', color: 'var(--color-text-primary)', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="balance" stroke="var(--color-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
