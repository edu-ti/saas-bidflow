import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, Award, XCircle, Clock, DollarSign, Target, Users, Briefcase, ShoppingCart, BarChart3, Loader2, Sparkles, ChevronRight, PieChart as PieChartIcon, Layout } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

// Reports Analysis Engine

type BiddingStats = {
  total: number;
  won: number;
  lost: number;
  pending: number;
  total_value: number;
  won_value: number;
};

type SalesStats = {
  total_leads: number;
  total_opportunities: number;
  won_opportunities: number;
  lost_opportunities: number;
  total_pipeline_value: number;
  won_value: number;
  conversion_rate: number;
};

type MonthlyData = {
  month: string;
  wins: number;
  losses: number;
  value: number;
};

type CategoryData = {
  name: string;
  value: number;
};

type StageData = {
  stage: string;
  value: number;
  count: number;
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'bidding' | 'sales'>('bidding');
  const [biddingStats, setBiddingStats] = useState<BiddingStats | null>(null);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [stageData, setStageData] = useState<StageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('year');

  useEffect(() => {
    fetchReportData();
  }, [dateRange, activeTab]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'bidding') {
        const [statsRes, monthlyRes, categoryRes, stageRes] = await Promise.all([
          api.get(`/api/reports/bidding-stats?range=${dateRange}`),
          api.get(`/api/reports/bidding-monthly?range=${dateRange}`),
          api.get(`/api/reports/bidding-categories?range=${dateRange}`),
          api.get(`/api/reports/bidding-stages?range=${dateRange}`)
        ]);
        setBiddingStats(statsRes.data);
        setMonthlyData(monthlyRes.data);
        setCategoryData(categoryRes.data);
        setStageData(stageRes.data);
      } else {
        const [statsRes, monthlyRes, categoryRes, stageRes] = await Promise.all([
          api.get(`/api/reports/sales-stats?range=${dateRange}`),
          api.get(`/api/reports/sales-monthly?range=${dateRange}`),
          api.get(`/api/reports/sales-categories?range=${dateRange}`),
          api.get(`/api/reports/sales-stages?range=${dateRange}`)
        ]);
        setSalesStats(statsRes.data);
        setMonthlyData(monthlyRes.data);
        setCategoryData(categoryRes.data);
        setStageData(stageRes.data);
      }
    } catch (error) {
      console.error("Error fetching reports", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.loading('Compilando dados para exportação BI...', { duration: 2000 });
    setTimeout(() => {
      window.print();
      toast.success('Relatório BI Platinum exportado com sucesso!');
    }, 2000);
  };

  const PLATINUM_COLORS = ['#6366f1', '#14b8a6', '#8b5cf6', '#3b82f6', '#ec4899', '#f43f5e'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value || 0);
  };

  const winRate = activeTab === 'bidding' 
    ? (biddingStats ? ((biddingStats.won / Math.max(1, (biddingStats.won + biddingStats.lost))) * 100).toFixed(1) : '0')
    : (salesStats ? salesStats.conversion_rate.toFixed(1) : '0');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-56 gap-6 bg-background h-screen animate-in fade-in duration-700">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
          <Layout className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted italic animate-pulse">Compilando Métricas Platinum...</span>
      </div>
    );
  }

  const kpis = activeTab === 'bidding' ? [
    { label: 'Total de Licitações', val: biddingStats?.total, icon: Award, color: 'text-primary', bg: 'bg-primary/10', desc: 'no período selecionado' },
    { label: 'Taxa de Acerto', val: `${winRate}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: `${biddingStats?.won || 0} ganha(s) / ${biddingStats?.lost || 0} perdida(s)` },
    { label: 'Valor Total', val: formatCurrency(biddingStats?.total_value || 0), icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'em propostas submetidas' },
    { label: 'Valor Ganho', val: formatCurrency(biddingStats?.won_value || 0), icon: Target, color: 'text-secondary', bg: 'bg-secondary/10', desc: 'contratos fechados' },
  ] : [
    { label: 'Total de Leads', val: salesStats?.total_leads, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'leads cadastrados' },
    { label: 'Taxa de Conversão', val: `${winRate}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'leads convertidos' },
    { label: 'Valor do Pipeline', val: formatCurrency(salesStats?.total_pipeline_value || 0), icon: Briefcase, color: 'text-accent', bg: 'bg-accent/10', desc: 'em oportunidades' },
    { label: 'Valor Fechado', val: formatCurrency(salesStats?.won_value || 0), icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10', desc: 'vendas concluídas' },
  ];

  return (
    <div className="p-8 min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Relatórios & <span className="text-gradient-gold">Business Intelligence</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <BarChart3 size={14} className="text-primary" />
            Análise aprofundada de performance comercial e competitividade estratégica.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-surface-elevated/20 border border-border-subtle p-2 rounded-2xl shadow-platinum-glow-sm backdrop-blur-md">
            <Calendar size={14} className="text-primary ml-3" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] text-text-primary outline-none cursor-pointer pr-4 hover:text-primary transition-colors"
            >
              <option value="month" className="bg-surface text-text-primary">Este Mês Atual</option>
              <option value="quarter" className="bg-surface text-text-primary">Este Trimestre Fiscal</option>
              <option value="year" className="bg-surface text-text-primary">Este Ano Fiscal</option>
              <option value="all" className="bg-surface text-text-primary">Todo o Período Histórico</option>
            </select>
          </div>
          
          <button 
            onClick={handleExport}
            className="btn-primary py-4 px-10 shadow-platinum-glow text-[10px] tracking-widest"
          >
            <Download size={14} className="mr-2" /> Exportar BI Platinum
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-3 p-2 bg-surface-elevated/20 border border-border-subtle rounded-[2rem] w-fit shadow-platinum-glow-sm backdrop-blur-md">
        {[
          { id: 'bidding', label: 'Licitações', icon: Target },
          { id: 'sales', label: 'Vendas', icon: ShoppingCart }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${
              activeTab === tab.id ? 'bg-primary text-background shadow-platinum-glow' : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="platinum-card p-10 flex flex-col gap-6 group hover:border-primary/40 transition-all relative overflow-hidden bg-surface-elevated/10 backdrop-blur-xl">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500">
              <kpi.icon size={120} className={kpi.color} />
            </div>
            <div className={`w-14 h-14 rounded-2xl ${kpi.bg} border border-border-subtle flex items-center justify-center shadow-platinum-glow-sm group-hover:scale-110 transition-transform duration-500`}>
              <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-60">{kpi.label}</p>
              <p className="text-3xl font-black text-text-primary mt-2 tracking-tighter group-hover:text-primary transition-colors">{kpi.val}</p>
              <p className="text-[10px] mt-3 text-text-muted font-bold italic opacity-40 uppercase tracking-widest">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Monthly Performance Chart */}
        <div className="platinum-card p-10 space-y-10 bg-surface-elevated/10 backdrop-blur-xl">
          <div className="flex justify-between items-center border-b border-border-subtle/30 pb-6">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.4em] flex items-center gap-4">
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-platinum-glow" />
              {activeTab === 'bidding' ? 'Performance Mensal' : 'Vendas por Mês Platinum'}
            </h3>
            <ChevronRight size={14} className="text-text-muted opacity-30" />
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" opacity={0.3} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 900 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 900 }} />
                <Tooltip 
                  cursor={{ fill: 'var(--color-surface-elevated)', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-medium)', borderRadius: '24px', boxShadow: 'var(--shadow-platinum)', padding: '16px', fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', color: 'var(--color-text-primary)' }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '30px', letterSpacing: '2px', opacity: 0.6 }} />
                <Bar dataKey="wins" name={activeTab === 'bidding' ? 'Ganhas' : 'Fechadas'} fill="var(--color-secondary)" radius={[8, 8, 0, 0]} barSize={32} />
                <Bar dataKey="losses" name="Perdidas" fill="#f43f5e" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Value Timeline Chart */}
        <div className="platinum-card p-10 space-y-10 bg-surface-elevated/10 backdrop-blur-xl">
          <div className="flex justify-between items-center border-b border-border-subtle/30 pb-6">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.4em] flex items-center gap-4">
              <div className="w-1.5 h-6 bg-accent rounded-full shadow-platinum-glow" />
              {activeTab === 'bidding' ? 'Curva de Valor Real' : 'Faturamento Platinum Neural'}
            </h3>
            <ChevronRight size={14} className="text-text-muted opacity-30" />
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" opacity={0.3} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 900 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 900 }} tickFormatter={(value) => `R$${value / 1000}k`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-medium)', borderRadius: '24px', boxShadow: 'var(--shadow-platinum)', padding: '16px', fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', color: 'var(--color-text-primary)' }} 
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={5} animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Categories Distribution */}
        <div className="platinum-card p-10 space-y-8 bg-surface-elevated/10 backdrop-blur-xl">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.4em] border-b border-border-subtle/30 pb-6">Distribuição Neural de Categoria</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PLATINUM_COLORS[index % PLATINUM_COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-medium)', borderRadius: '24px', boxShadow: 'var(--shadow-platinum)', padding: '16px', fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', color: 'var(--color-text-primary)' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 pt-4">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/20 border border-border-subtle/30 group hover:border-primary/40 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full shadow-platinum-glow-sm" style={{ backgroundColor: PLATINUM_COLORS[index % PLATINUM_COLORS.length] }} />
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] group-hover:text-text-primary transition-colors">{item.name}</span>
                </div>
                <span className="text-[11px] font-black text-text-primary tracking-tighter">{item.value} unidades</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel Stage Bar Chart */}
        <div className="lg:col-span-2 platinum-card p-10 space-y-10 bg-surface-elevated/10 backdrop-blur-xl">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.4em] border-b border-border-subtle/30 pb-6">
            {activeTab === 'bidding' ? 'Métricas por Etapa Licitatória RPA' : 'Volume por Fase Comercial Platinum'}
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical" margin={{ top: 5, right: 50, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border-subtle)" opacity={0.3} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 900 }} tickFormatter={(value) => `R$${value / 1000}k`} dy={10} />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 9, fill: 'var(--color-text-primary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-medium)', borderRadius: '24px', boxShadow: 'var(--shadow-platinum)', padding: '16px', fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', color: 'var(--color-text-primary)' }} 
                />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 12, 12, 0]} barSize={24} shadow="var(--shadow-platinum-glow-sm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}