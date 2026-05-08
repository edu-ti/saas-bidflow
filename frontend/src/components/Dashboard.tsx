import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import {
  DollarSign, Target, Award, PieChart as PieChartIcon, Activity,
  ArrowUpRight, ArrowDownRight, Loader2, Save, TrendingUp, BarChart3,
  FileText, Percent, Ticket, CheckCircle2, ChevronLeft, ChevronRight, Users
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Modal } from './ui/Modal';

type PipelineStat = {
  name: string;
  value: number;
  count: number;
  color: string;
};

type WinRate = {
  won: number;
  lost: number;
  rate: number;
};

type TopOrg = {
  name: string;
  total_value: number;
};

type SalesMetrics = {
  total_proposals: number;
  total_value: number;
  won_count: number;
  won_value: number;
  ticket_medio: number;
  conversion_rate: number;
};

type TeamUser = {
  user_id: number;
  user_name: string;
  won_count: number;
  won_value: number;
  total_opps: number;
  win_rate: number;
};

type MonthlyEvolution = {
  month: number;
  month_name: string;
  realizado: number;
  meta: number;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<PipelineStat[]>([]);
  const [winRate, setWinRate] = useState<WinRate | null>(null);
  const [topOrgs, setTopOrgs] = useState<TopOrg[]>([]);
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [teamPerf, setTeamPerf] = useState<TeamUser[]>([]);
  const [marketEvol, setMarketEvol] = useState<MonthlyEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Goal modal state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    goal_type: 'global',
    target_id: '',
    uf: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    target_revenue: '',
    target_wins: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('/api/dashboard/stats'),
      api.get('/api/reports/sales').catch(() => ({ data: null })),
      api.get('/api/reports/team-performance').catch(() => ({ data: [] })),
      api.get('/api/reports/market-evolution').catch(() => ({ data: [] })),
    ])
      .then(([dashRes, salesRes, teamRes, evolRes]) => {
        setPipeline(dashRes.data.pipeline || []);
        setWinRate(dashRes.data.win_rate || { won: 0, lost: 0, rate: 0 });
        setTopOrgs(dashRes.data.top_organizations || []);
        if (salesRes.data) setSalesMetrics(salesRes.data);
        setTeamPerf(teamRes.data || []);
        setMarketEvol(evolRes.data || []);
      })
      .catch(err => console.error("Could not fetch stats", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoal(true);
    try {
      await api.post('/api/goals', {
        ...goalForm,
        target_id: goalForm.target_id ? parseInt(goalForm.target_id) : null,
        target_revenue: parseFloat(goalForm.target_revenue) || 0,
        target_wins: parseInt(goalForm.target_wins as string) || 0,
      });
      toast.success('Meta estratégica definida com sucesso!');
      setIsGoalModalOpen(false);
      setGoalForm({
        goal_type: 'global', target_id: '', uf: '',
        month: new Date().getMonth() + 1, year: new Date().getFullYear(),
        target_revenue: '', target_wins: '',
      });
    } catch {
      toast.error('Erro ao salvar a meta.');
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
      <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
      <div className="text-sm text-text-muted font-medium">Carregando métricas...</div>
    </div>
  );

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const formatCurrencyShort = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v || 0);

  const totalPipelineValue = pipeline.reduce((acc, curr) => acc + curr.value, 0);
  const totalOpportunities = pipeline.reduce((acc, curr) => acc + curr.count, 0);

  const months = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
  ];

  // Pie chart data for stages
  const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6d28d9', '#4f46e5', '#7c3aed', '#5b21b6'];
  const stageData = pipeline.map(p => ({ name: p.name, value: p.count }));

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Dashboard Unificado
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Visão consolidada de licitações, vendas e performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button
             onClick={() => navigate('/reports-dashboard')}
             className="btn btn-outline text-xs"
           >
             <Activity size={14} /> BI Inteligente
           </button>
           <button
             onClick={() => setIsGoalModalOpen(true)}
             className="btn btn-primary text-xs"
           >
             <Target size={14} /> Nova Meta
           </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 1: Licitações KPIs (5 cards)
       ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Taxa de Conversão */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <Award size={18} />
            </div>
            {winRate && winRate.rate > 0 && (
              <div className="flex items-center gap-1 text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded">
                <ArrowUpRight size={10} /> {winRate.rate}%
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">Taxa de Conversão</p>
            <p className="text-2xl font-bold text-text-primary tracking-tight">{winRate?.rate || 0}%</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] border-t border-border pt-3">
            <span className="text-text-muted">Ganhos <strong className="text-success">{winRate?.won}</strong></span>
            <span className="text-text-muted">Perdas <strong className="text-danger">{winRate?.lost}</strong></span>
          </div>
        </div>

        {/* Volume no Funil */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <DollarSign size={18} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">Volume no Funil</p>
            <p className="text-2xl font-bold text-text-primary tracking-tight">{formatCurrencyShort(totalPipelineValue)}</p>
          </div>
          <p className="text-[10px] text-text-muted border-t border-border pt-3">
            Valor bruto de todas oportunidades ativas.
          </p>
        </div>

        {/* Oportunidades Ativas */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center text-info">
            <PieChartIcon size={18} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">Oportunidades Ativas</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-bold text-text-primary tracking-tight">{totalOpportunities}</p>
              <span className="text-xs text-text-muted">unid.</span>
            </div>
          </div>
          <div className="flex items-center gap-1 w-full border-t border-border pt-3">
            {pipeline.map((p, i) => (
              <div key={i} className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${(p.count / Math.max(totalOpportunities, 1)) * 100}%`, opacity: 1 - (i * 0.12) }} title={`${p.name}: ${p.count}`} />
            ))}
          </div>
        </div>

        {/* Valor Aprovado (Propostas - Funil de Vendas) */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">Valor Aprovado <span className="text-text-muted">(Propostas)</span></p>
            <p className="text-2xl font-bold text-text-primary tracking-tight">{formatCurrency(salesMetrics?.won_value || 0)}</p>
          </div>
          <p className="text-[10px] text-text-muted border-t border-border pt-3">
            Funil de vendas — {salesMetrics?.won_count || 0} propostas ganhas.
          </p>
        </div>

        {/* Ticket Médio (Funil de Vendas) */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Ticket size={18} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">Ticket Médio <span className="text-text-muted">(Vendas)</span></p>
            <p className="text-2xl font-bold text-text-primary tracking-tight">{formatCurrency(salesMetrics?.ticket_medio || 0)}</p>
          </div>
          <p className="text-[10px] text-text-muted border-t border-border pt-3">
            Conv. {salesMetrics?.conversion_rate || 0}% — {salesMetrics?.total_proposals || 0} propostas.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 2: Charts — Evolução do Funil + Top Órgãos
       ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="card p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-text-primary mb-6">
            Evolução do Funil (Valuation)
          </h3>
          <div className="h-72 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} tickFormatter={(val) => `R$ ${(val/1000)}k`} />
                <Tooltip
                  cursor={{ stroke: 'var(--color-border-hover)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', fontSize: '12px', color: 'var(--color-text-primary)' }}
                  itemStyle={{ color: 'var(--color-primary)', fontWeight: 600 }}
                  formatter={(value: number) => [formatCurrencyShort(value), 'Valuation']}
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-text-primary mb-6">
            Top Órgãos Licitantes
          </h3>
          <div className="h-72 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topOrgs} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} tickFormatter={(val) => `R$ ${(val/1000)}k`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={140} tick={{ fontSize: 11, fill: 'var(--color-text-primary)' }} />
                <Tooltip
                  cursor={{ fill: 'var(--color-bg-tertiary)', opacity: 0.5 }}
                  contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', fontSize: '12px', color: 'var(--color-text-primary)' }}
                  itemStyle={{ color: 'var(--color-primary)', fontWeight: 600 }}
                  formatter={(value: number) => [formatCurrency(value), 'Total']}
                />
                <Bar dataKey="total_value" radius={[0, 6, 6, 0]} barSize={24}>
                  {topOrgs.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="var(--color-primary)" fillOpacity={1 - index * 0.15} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 3: Oportunidades por Etapa (Donut) + Sales Summary cards
       ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Donut Chart — Oportunidades por Etapa */}
        <div className="card p-6 flex flex-col lg:col-span-3">
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Oportunidades por Etapa
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {stageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)' }}
                  formatter={(value: number, name: string) => [value, name]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', color: 'var(--color-text-secondary)', paddingTop: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Summary Cards */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <BarChart3 size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-secondary">Oportunidades Totais</p>
              <p className="text-xl font-bold text-text-primary">{totalOpportunities}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-text-muted">Pipeline</p>
              <p className="text-xs font-semibold text-text-primary">{pipeline.length} etapas</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <DollarSign size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-secondary">Valor Total (Pipeline)</p>
              <p className="text-xl font-bold text-text-primary">{formatCurrency(totalPipelineValue)}</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Percent size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-secondary">Conv. Oportunidades</p>
              <p className="text-xl font-bold text-text-primary">{salesMetrics?.conversion_rate || winRate?.rate || 0}%</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-text-muted">Ganhos</p>
              <p className="text-xs font-semibold text-success">{winRate?.won || 0}</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-secondary">Propostas (Vendas)</p>
              <p className="text-xl font-bold text-text-primary">{salesMetrics?.total_proposals || 0}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-text-muted">Valor</p>
              <p className="text-xs font-semibold text-text-primary">{formatCurrencyShort(salesMetrics?.total_value || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 4: Evolução de Mercado (LineChart — Realizado vs Meta)
       ═══════════════════════════════════════════════════════════════ */}
      <div className="card p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Evolução de Mercado</h3>
            <p className="text-xs text-text-muted mt-0.5">Receita realizada vs metas definidas — {new Date().getFullYear()}</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full bg-primary inline-block" /> Realizado</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full bg-emerald-500 inline-block border border-dashed border-emerald-500" /> Meta</span>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={marketEvol} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
              <XAxis dataKey="month_name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)' }}
                formatter={(value: number, name: string) => [formatCurrency(value), name === 'realizado' ? 'Realizado' : 'Meta']}
              />
              <Area type="monotone" dataKey="realizado" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRealizado)" dot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="meta" stroke="#10b981" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 5: Performance por Vendedor (Carousel)
       ═══════════════════════════════════════════════════════════════ */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Users size={16} className="text-primary" /> Performance por Vendedor
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Mês de {new Date().toLocaleDateString('pt-BR', { month: 'long' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => carouselRef.current?.scrollBy({ left: -260, behavior: 'smooth' })}
              className="p-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => carouselRef.current?.scrollBy({ left: 260, behavior: 'smooth' })}
              className="p-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div ref={carouselRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {teamPerf.length > 0 ? teamPerf.map((user) => {
            const initials = user.user_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div key={user.user_id} className="flex-shrink-0 w-56 snap-start p-5 rounded-xl border border-border bg-bg-tertiary/40 hover:border-primary/30 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-bg-secondary border-2 border-border flex items-center justify-center text-primary font-bold text-sm shrink-0 group-hover:border-primary/40 transition-colors">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate uppercase tracking-wide">{user.user_name}</p>
                    <p className="text-lg font-bold text-primary tracking-tight">{formatCurrency(user.won_value)}</p>
                  </div>
                </div>
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest">Vendas Aprovadas</p>
              </div>
            );
          }) : (
            <div className="flex items-center justify-center w-full py-8">
              <p className="text-sm text-text-muted">Nenhum dado de vendedores no período.</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          GOAL MODAL
       ═══════════════════════════════════════════════════════════════ */}
      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Definir Nova Meta Estratégica" size="md">
        <form onSubmit={handleSaveGoal} className="space-y-6 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Tipo de Meta</label>
              <select value={goalForm.goal_type} onChange={e => setGoalForm({ ...goalForm, goal_type: e.target.value })} className="input">
                <option value="global">Global (Empresa)</option>
                <option value="user">Por Usuário</option>
                <option value="supplier">Por Fornecedor</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">UF (opcional)</label>
              <input type="text" value={goalForm.uf} onChange={e => setGoalForm({ ...goalForm, uf: e.target.value.toUpperCase().slice(0, 2) })} className="input" placeholder="Ex: SP" maxLength={2} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Mês</label>
              <select value={goalForm.month} onChange={e => setGoalForm({ ...goalForm, month: parseInt(e.target.value) })} className="input">
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Ano</label>
              <input type="number" value={goalForm.year} onChange={e => setGoalForm({ ...goalForm, year: parseInt(e.target.value) })} className="input" min={2024} max={2030} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Receita Alvo (R$)</label>
              <input type="number" step="0.01" value={goalForm.target_revenue} onChange={e => setGoalForm({ ...goalForm, target_revenue: e.target.value })} className="input" placeholder="100000.00" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Vitórias Alvo</label>
              <input type="number" value={goalForm.target_wins} onChange={e => setGoalForm({ ...goalForm, target_wins: e.target.value })} className="input" placeholder="10" required />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsGoalModalOpen(false)} className="btn btn-outline">Cancelar</button>
            <button type="submit" disabled={savingGoal} className="btn btn-primary flex items-center gap-2">
              {savingGoal ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Meta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
