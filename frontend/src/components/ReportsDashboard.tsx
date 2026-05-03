import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  LayoutDashboard, Target, Wallet, TrendingUp, TrendingDown, DollarSign,
  Award, Calendar, Users, Filter, ShieldCheck, Zap, BarChart3, ChevronRight, Lock, Loader2, FileText, Clock
} from 'lucide-react';
import api from '../lib/axios';

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
    api.get('/api/reports/users').then(res => setUsers(res.data)).catch(console.error);
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
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchAllData();
  }, [period, userId, startDate, endDate]);

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Compilando Inteligência Estratégica...</span>
    </div>
  );

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Strategic <span className="text-gradient-gold">Intelligence & Analytics</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <BarChart3 size={12} className="text-primary" />
            Consolidação de dados operacionais, financeiros e performance de equipe.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
          <button className="px-6 py-2 bg-primary text-background font-black rounded-xl shadow-platinum-glow text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all">
            Exportar PDF
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="platinum-card p-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-primary" />
          <select 
            value={period} 
            onChange={e => setPeriod(e.target.value as any)}
            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white outline-none cursor-pointer"
          >
            <option value="month" className="bg-surface">Este Mês</option>
            <option value="30days" className="bg-surface">Últimos 30 dias</option>
            <option value="year" className="bg-surface">Este Ano</option>
            <option value="custom" className="bg-surface">Personalizado</option>
          </select>
        </div>
        <div className="w-px h-6 bg-white/5" />
        <div className="flex items-center gap-3">
          <Users size={16} className="text-primary" />
          <select 
            value={userId || ''} 
            onChange={e => setUserId(e.target.value ? Number(e.target.value) : null)}
            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white outline-none cursor-pointer"
          >
            <option value="" className="bg-surface">Todos os Responsáveis</option>
            {users.map(u => <option key={u.id} value={u.id} className="bg-surface">{u.name}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
        {['overview', 'bidding', 'financial'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-primary text-background shadow-platinum-glow' : 'text-text-muted hover:text-white'
            }`}
          >
            {tab === 'overview' ? 'Visão Geral' : tab === 'bidding' ? 'Licitações' : 'Saúde Financeira'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Receita (MRR)', val: formatCurrency(overview?.revenue), icon: DollarSign, color: 'text-emerald-400' },
              { label: 'Win Rate Global', val: `${overview?.win_rate?.toFixed(1)}%`, icon: TrendingUp, color: 'text-blue-400' },
              { label: 'Novos Ativos', val: overview?.new_contracts, icon: Award, color: 'text-primary' },
              { label: 'Target Opps', val: overview?.total_opportunities, icon: Target, color: 'text-amber-500' },
            ].map((kpi, i) => (
              <div key={i} className="platinum-card p-6 flex flex-col gap-4 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{kpi.label}</p>
                  <p className="text-xl font-black text-white mt-1">{kpi.val || 0}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="platinum-card p-8 space-y-6">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Performance da Estrutura</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamPerformance.slice(0, 5)} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900 }} tickFormatter={v => `R$${v/1000}k`} />
                    <YAxis dataKey="user_name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900 }} />
                    <Tooltip cursor={{ fill: '#ffffff02' }} contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                    <Bar dataKey="won_value" fill="#EAB308" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="platinum-card p-8 space-y-8">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Resumo Operacional</h3>
              <div className="space-y-4">
                {[
                  { label: 'Oportunidades Ganhas', val: overview?.won_opportunities, icon: Award, color: 'text-emerald-400' },
                  { label: 'Volume em Negociação', val: (overview?.total_opportunities - overview?.won_opportunities), icon: Target, color: 'text-blue-400' },
                  { label: 'Taxa de Conversão', val: `${overview?.win_rate?.toFixed(1)}%`, icon: Zap, color: 'text-primary' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 bg-white/5 rounded-lg ${item.color}`}>
                        <item.icon size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{item.label}</span>
                    </div>
                    <span className="text-lg font-black text-white">{item.val || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bidding' && (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Editais em Análise', val: biddingMetrics?.total, icon: FileText, color: 'text-blue-400' },
              { label: 'Win Rate Licitações', val: `${biddingMetrics?.win_rate?.toFixed(1)}%`, icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'Alertas RPA', val: biddingMetrics?.captured_alerts, icon: Zap, color: 'text-primary' },
              { label: 'Valuation Ganho', val: formatCurrency(biddingMetrics?.won_value), icon: DollarSign, color: 'text-amber-500' },
            ].map((kpi, i) => (
              <div key={i} className="platinum-card p-6 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{kpi.label}</p>
                  <p className="text-xl font-black text-white mt-1">{kpi.val || 0}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="platinum-card p-8 space-y-8">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Funil de Conversão Licitatória</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={biddingFunnel} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900 }} />
                  <Tooltip cursor={{ fill: '#ffffff02' }} contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#EAB308" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="space-y-8 animate-in slide-in-from-left duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Liquidez Disponível', val: formatCurrency(financialHealth?.liquidity), icon: Wallet, color: 'text-primary' },
              { label: 'Burn Rate Médio', val: formatCurrency(financialHealth?.burn_rate), icon: TrendingDown, color: 'text-red-400' },
              { label: 'Runway Estimado', val: `${financialHealth?.runway} Meses`, icon: Clock, color: 'text-amber-500' },
              { label: 'Saúde Patrimonial', val: 'Ótima', icon: ShieldCheck, color: 'text-emerald-400' },
            ].map((kpi, i) => (
              <div key={i} className="platinum-card p-6 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{kpi.label}</p>
                  <p className="text-xl font-black text-white mt-1">{kpi.val || 0}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="platinum-card p-8 space-y-8">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Evolução de Fluxo de Caixa</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financialTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900 }} tickFormatter={v => `R$${v/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="balance" stroke="#EAB308" strokeWidth={3} dot={{ fill: '#EAB308', r: 4 }} activeDot={{ r: 6, stroke: '#EAB308', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

