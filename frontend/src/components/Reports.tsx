import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, Award, XCircle, Clock, DollarSign, Target, Users, Briefcase, ShoppingCart, BarChart3, Loader2, Sparkles } from 'lucide-react';
import api from '../lib/axios';

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

  const PLATINUM_COLORS = ['#fbbf24', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const winRate = activeTab === 'bidding' 
    ? (biddingStats ? ((biddingStats.won / Math.max(1, (biddingStats.won + biddingStats.lost))) * 100).toFixed(1) : '0')
    : (salesStats ? salesStats.conversion_rate.toFixed(1) : '0');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 bg-background h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted italic">Compilando Métricas Platinum...</span>
      </div>
    );
  }

  const kpis = activeTab === 'bidding' ? [
    { label: 'Total de Licitações', val: biddingStats?.total, icon: Award, color: 'text-primary', desc: 'no período selecionado' },
    { label: 'Taxa de Acerto', val: `${winRate}%`, icon: TrendingUp, color: 'text-emerald-400', desc: `${biddingStats?.won || 0} ganha(s) / ${biddingStats?.lost || 0} perdida(s)` },
    { label: 'Valor Total', val: formatCurrency(biddingStats?.total_value || 0), icon: DollarSign, color: 'text-blue-400', desc: 'em propostas submetidas' },
    { label: 'Valor Ganho', val: formatCurrency(biddingStats?.won_value || 0), icon: Target, color: 'text-amber-500', desc: 'contratos fechados' },
  ] : [
    { label: 'Total de Leads', val: salesStats?.total_leads, icon: Users, color: 'text-blue-400', desc: 'leads cadastrados' },
    { label: 'Taxa de Conversão', val: `${winRate}%`, icon: Target, color: 'text-emerald-400', desc: 'leads convertidos' },
    { label: 'Valor do Pipeline', val: formatCurrency(salesStats?.total_pipeline_value || 0), icon: Briefcase, color: 'text-purple-400', desc: 'em oportunidades' },
    { label: 'Valor Fechado', val: formatCurrency(salesStats?.won_value || 0), icon: ShoppingCart, color: 'text-primary', desc: 'vendas concluídas' },
  ];

  return (
    <div className="p-8 min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Relatórios & <span className="text-gradient-gold">Business Intelligence</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <BarChart3 size={12} className="text-primary" />
            Análise aprofundada de performance comercial e competitividade.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
            <Calendar size={14} className="text-primary ml-2" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white outline-none cursor-pointer pr-2"
            >
              <option value="month" className="bg-surface">Este Mês</option>
              <option value="quarter" className="bg-surface">Este Trimestre</option>
              <option value="year" className="bg-surface">Este Ano</option>
              <option value="all" className="bg-surface">Todo o Período</option>
            </select>
          </div>
          
          <button className="flex items-center gap-3 px-6 py-2.5 bg-primary text-background font-black rounded-xl shadow-platinum-glow text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all">
            <Download size={14} /> Exportar BI
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
        {[
          { id: 'bidding', label: 'Licitações', icon: Target },
          { id: 'sales', label: 'Vendas', icon: ShoppingCart }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-primary text-background shadow-platinum-glow' : 'text-text-muted hover:text-white'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="platinum-card p-6 flex flex-col gap-4 group hover:border-primary/20 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <kpi.icon size={48} className={kpi.color} />
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{kpi.label}</p>
              <p className="text-xl font-black text-white mt-1">{kpi.val}</p>
              <p className="text-[10px] mt-2 text-text-muted/60 font-bold italic">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Performance Chart */}
        <div className="platinum-card p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              {activeTab === 'bidding' ? 'Performance Mensal' : 'Vendas por Mês'}
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                <Tooltip 
                  cursor={{ fill: '#ffffff02' }}
                  contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px', color: '#fff' }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} />
                <Bar dataKey="wins" name={activeTab === 'bidding' ? 'Ganhas' : 'Fechadas'} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="losses" name="Perdidas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Value Timeline Chart */}
        <div className="platinum-card p-8 space-y-6">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
            {activeTab === 'bidding' ? 'Curva de Valor' : 'Faturamento Platinum'}
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} tickFormatter={(value) => `R$${value / 1000}k`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px', color: '#fff' }} 
                />
                <Area type="monotone" dataKey="value" stroke="#fbbf24" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories Distribution */}
        <div className="platinum-card p-8 space-y-6">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Distribuição de Categoria</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PLATINUM_COLORS[index % PLATINUM_COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px', color: '#fff' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATINUM_COLORS[index % PLATINUM_COLORS.length] }} />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel Stage Bar Chart */}
        <div className="lg:col-span-2 platinum-card p-8 space-y-6">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
            {activeTab === 'bidding' ? 'Métricas por Etapa Licitatória' : 'Volume por Fase Comercial'}
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff05" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} tickFormatter={(value) => `R$${value / 1000}k`} />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900, textTransform: 'uppercase' }} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px', color: '#fff' }} 
                />
                <Bar dataKey="value" fill="#fbbf24" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}