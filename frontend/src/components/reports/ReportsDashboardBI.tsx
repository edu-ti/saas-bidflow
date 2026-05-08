import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, TrendingUp, Award, DollarSign, Target, Users, Briefcase, ShoppingCart, BarChart3, Loader2, ChevronRight, PieChart as PieChartIcon } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Select } from '../ui/Select';

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

type MonthlyData = { month: string; wins: number; losses: number; value: number; };
type CategoryData = { name: string; value: number; };
type StageData = { stage: string; value: number; count: number; };

export default function ReportsDashboardBI() {
  const [activeTab, setActiveTab] = useState<'bidding' | 'sales'>('bidding');
  const [biddingStats, setBiddingStats] = useState<BiddingStats | null>(null);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [stageData, setStageData] = useState<StageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('year');

  useEffect(() => { fetchReportData(); }, [dateRange, activeTab]);

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
    toast.loading('Compilando dados para exportação...', { duration: 2000 });
    setTimeout(() => { window.print(); toast.success('Relatório exportado!'); }, 2000);
  };

  const COLORS = ['#6366f1', '#14b8a6', '#8b5cf6', '#3b82f6', '#ec4899', '#f43f5e'];
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value || 0);

  const winRate = activeTab === 'bidding'
    ? (biddingStats ? ((biddingStats.won / Math.max(1, (biddingStats.won + biddingStats.lost))) * 100).toFixed(1) : '0')
    : (salesStats ? salesStats.conversion_rate.toFixed(1) : '0');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
        <span className="text-sm text-text-muted">Compilando métricas...</span>
      </div>
    );
  }

  const kpis = activeTab === 'bidding' ? [
    { label: 'Total de Licitações', val: biddingStats?.total, icon: Award, color: 'text-primary', bg: 'bg-primary/10', desc: 'no período' },
    { label: 'Taxa de Acerto', val: `${winRate}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: `${biddingStats?.won || 0} ganhas / ${biddingStats?.lost || 0} perdidas` },
    { label: 'Valor Total', val: formatCurrency(biddingStats?.total_value || 0), icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'propostas submetidas' },
    { label: 'Valor Ganho', val: formatCurrency(biddingStats?.won_value || 0), icon: Target, color: 'text-secondary', bg: 'bg-secondary/10', desc: 'contratos fechados' },
  ] : [
    { label: 'Total de Leads', val: salesStats?.total_leads, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'leads cadastrados' },
    { label: 'Taxa de Conversão', val: `${winRate}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'leads convertidos' },
    { label: 'Valor do Pipeline', val: formatCurrency(salesStats?.total_pipeline_value || 0), icon: Briefcase, color: 'text-accent', bg: 'bg-accent/10', desc: 'em oportunidades' },
    { label: 'Valor Fechado', val: formatCurrency(salesStats?.won_value || 0), icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10', desc: 'vendas concluídas' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Sub-filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex gap-2 p-1 bg-bg-tertiary/50 border border-border rounded-xl">
          {[
            { id: 'bidding', label: 'Licitações', icon: Target },
            { id: 'sales', label: 'Vendas', icon: ShoppingCart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Select 
            value={dateRange}
            onChange={setDateRange}
            options={[
              { value: 'month', label: 'Este Mês' },
              { value: 'quarter', label: 'Trimestre' },
              { value: 'year', label: 'Ano Fiscal' },
              { value: 'all', label: 'Todo Período' }
            ]}
            className="w-48"
          />
          <button onClick={handleExport} className="btn btn-outline text-xs">
            <Download size={14} /> Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="card p-5 flex flex-col gap-3 group hover:border-primary/30 transition-all">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary">{kpi.label}</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{kpi.val}</p>
              <p className="text-[10px] mt-1.5 text-text-muted">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-6">
            {activeTab === 'bidding' ? 'Performance Mensal' : 'Vendas por Mês'}
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '16px' }} />
                <Bar dataKey="wins" name={activeTab === 'bidding' ? 'Ganhas' : 'Fechadas'} fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="losses" name="Perdidas" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-6">Curva de Valor</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="biColorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fillOpacity={1} fill="url(#biColorValue)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Category + Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Distribuição por Categoria</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-text-muted">{item.name}</span>
                </div>
                <span className="font-semibold text-text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 card p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-6">
            {activeTab === 'bidding' ? 'Métricas por Etapa Licitatória' : 'Volume por Fase Comercial'}
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} tickFormatter={(v) => `R$${v / 1000}k`} />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 11, fill: 'var(--color-text-primary)' }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
