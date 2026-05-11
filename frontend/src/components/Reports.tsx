import { useState, useEffect } from 'react';
import { 
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
 AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, Award, XCircle, Clock, DollarSign, Target, Users, Briefcase, ShoppingCart, BarChart3, Loader2, Sparkles, ChevronRight, PieChart as PieChartIcon, Layout } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Select } from './ui/Select';

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
 toast.success('Relatório BI exportado com sucesso!');
 }, 2000);
 };

 const _COLORS = ['#6366f1', '#14b8a6', '#8b5cf6', '#3b82f6', '#ec4899', '#f43f5e'];

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
 <span className="text-xs font-semibold uppercase text-text-muted italic animate-pulse">Compilando Métricas...</span>
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
 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-20">
 <div className="space-y-1">
 <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
 Relatórios & <span className="text-primary">Business Intelligence</span>
 </h1>
 <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
 <BarChart3 size={14} className="text-primary" />
 Análise aprofundada de performance comercial e competitividade estratégica.
 </p>
 </div>
 
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-3">
 <Select 
 value={dateRange}
 onChange={setDateRange}
 options={[
 { value: 'month', label: 'Este Mês Atual' },
 { value: 'quarter', label: 'Este Trimestre Fiscal' },
 { value: 'year', label: 'Este Ano Fiscal' },
 { value: 'all', label: 'Todo o Período Histórico' }
 ]}
 className="w-64 "
 />
 </div>
 
 <button 
 onClick={handleExport}
 className="btn btn-primary py-4 px-10 text-xs tracking-widest"
 >
 <Download size={14} className="mr-2" /> Exportar BI 
 </button>
 </div>
 </header>

 {/* Tabs */}
 <div className="flex gap-3 p-2 bg-bg-tertiary/20 border border-border rounded-xl w-fit backdrop-blur-md">
 {[
 { id: 'bidding', label: 'Licitações', icon: Target },
 { id: 'sales', label: 'Vendas', icon: ShoppingCart }
 ].map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id as any)}
 className={`flex items-center gap-3 px-10 py-3.5 rounded-2xl text-xs font-semibold uppercase tracking-widest transition-all duration-500 ${
 activeTab === tab.id ? 'bg-primary text-background ' : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary/50'
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
 <div key={i} className="card p-10 flex flex-col gap-6 group hover:border-primary/40 transition-all relative overflow-hidden bg-bg-tertiary/10 backdrop-blur-xl">
 <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500">
 <kpi.icon size={120} className={kpi.color} />
 </div>
 <div className={`w-14 h-14 rounded-2xl ${kpi.bg} border border-border flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
 <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
 </div>
 <div className="relative z-10">
 <p className="text-xs font-semibold uppercase tracking-widest text-text-muted opacity-60">{kpi.label}</p>
 <p className="text-3xl font-semibold text-text-primary mt-2 tracking-tight group-hover:text-primary transition-colors">{kpi.val}</p>
 <p className="text-xs mt-3 text-text-muted font-bold italic opacity-40 uppercase tracking-widest">{kpi.desc}</p>
 </div>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
 {/* Monthly Performance Chart */}
 <div className="card p-10 space-y-10 bg-bg-tertiary/10 backdrop-blur-xl">
 <div className="flex justify-between items-center border-b border-border/30 pb-6">
 <h3 className="text-xs font-semibold text-text-primary uppercase flex items-center gap-4">
 <div className="w-1.5 h-6 bg-primary rounded-full " />
 {activeTab === 'bidding' ? 'Performance Mensal' : 'Vendas por Mês '}
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
 contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-medium)', borderRadius: '24px', boxShadow: 'var(--shadow-)', padding: '16px', fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', color: 'var(--color-text-primary)' }} 
 />
 <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '30px', letterSpacing: '2px', opacity: 0.6 }} />
 <Bar dataKey="wins" name={activeTab === 'bidding' ? 'Ganhas' : 'Fechadas'} fill="var(--color-secondary)" radius={[8, 8, 0, 0]} barSize={32} />
 <Bar dataKey="losses" name="Perdidas" fill="#f43f5e" radius={[8, 8, 0, 0]} barSize={32} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Value Timeline Chart */}
 <div className="card p-10 space-y-10 bg-bg-tertiary/10 backdrop-blur-xl">
 <div className="flex justify-between items-center border-b border-border/30 pb-6">
 <h3 className="text-xs font-semibold text-text-primary uppercase flex items-center gap-4">
 <div className="w-1.5 h-6 bg-accent rounded-full " />
 {activeTab === 'bidding' ? 'Curva de Valor Real' : 'Faturamento Neural'}
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
 contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-medium)', borderRadius: '24px', boxShadow: 'var(--shadow-)', padding: '16px', fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', color: 'var(--color-text-primary)' }} 
 />
 <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={5} animationDuration={2000} />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
 {/* Categories Distribution */}
 <div className="card p-10 space-y-8 bg-bg-tertiary/10 backdrop-blur-xl">
 <h3 className="text-xs font-semibold text-text-primary uppercase border-b border-border/30 pb-6">Distribuição Neural de Categoria</h3>
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
 <Cell key={`cell-${index}`} fill={_COLORS[index % _COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
 ))}
 </Pie>
 <Tooltip 
 contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-medium)', borderRadius: '24px', boxShadow: 'var(--shadow-)', padding: '16px', fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', color: 'var(--color-text-primary)' }} 
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 <div className="space-y-3 pt-4">
 {categoryData.map((item, index) => (
 <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-bg-tertiary/20 border border-border/30 group hover:border-primary/40 transition-all">
 <div className="flex items-center gap-4">
 <div className="w-3 h-3 rounded-full " style={{ backgroundColor: _COLORS[index % _COLORS.length] }} />
 <span className="text-xs font-semibold text-text-muted uppercase tracking-wider group-hover:text-text-primary transition-colors">{item.name}</span>
 </div>
 <span className="text-sm font-semibold text-text-primary tracking-tight">{item.value} unidades</span>
 </div>
 ))}
 </div>
 </div>

 {/* Funnel Stage Bar Chart */}
 <div className="lg:col-span-2 card p-10 space-y-10 bg-bg-tertiary/10 backdrop-blur-xl">
 <h3 className="text-xs font-semibold text-text-primary uppercase border-b border-border/30 pb-6">
 {activeTab === 'bidding' ? 'Métricas por Etapa Licitatória RPA' : 'Volume por Fase Comercial '}
 </h3>
 <div className="h-[400px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={stageData} layout="vertical" margin={{ top: 5, right: 50, left: 60, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border-subtle)" opacity={0.3} />
 <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 900 }} tickFormatter={(value) => `R$${value / 1000}k`} dy={10} />
 <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 9, fill: 'var(--color-text-primary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }} />
 <Tooltip 
 formatter={(value: number) => formatCurrency(value)}
 contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-medium)', borderRadius: '24px', boxShadow: 'var(--shadow-)', padding: '16px', fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', color: 'var(--color-text-primary)' }} 
 />
 <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 12, 12, 0]} barSize={24} shadow="var(--)" />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 </div>
 );
}