import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, DollarSign, Target, Award, PieChart, Zap, ShieldCheck, Activity, Globe, ArrowUpRight } from 'lucide-react';
import api from '../lib/axios';

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

export default function Dashboard() {
  const [pipeline, setPipeline] = useState<PipelineStat[]>([]);
  const [winRate, setWinRate] = useState<WinRate | null>(null);
  const [topOrgs, setTopOrgs] = useState<TopOrg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then(res => {
        setPipeline(res.data.pipeline || []);
        setWinRate(res.data.win_rate || { won: 0, lost: 0, rate: 0 });
        setTopOrgs(res.data.top_organizations || []);
      })
      .catch(err => console.error("Could not fetch stats", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6 animate-in fade-in duration-700">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin shadow-platinum-glow" />
        <Zap size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
      </div>
      <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em]">Auditando Performance Neural...</div>
    </div>
  );

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 animate-in fade-in duration-700 text-text-primary">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Performance <span className="text-gradient-gold">Estratégica Platinum</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={14} className="text-primary" /> 
            Visão consolidada da inteligência comercial e fluxos de licitação RPA.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 bg-surface-elevated/40 border border-border-subtle p-2 rounded-2xl shadow-platinum-glow-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-surface-elevated flex items-center justify-center text-[10px] font-black text-primary">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest px-2">Time Ativo</span>
           </div>
           <button className="btn-primary py-4 px-10 shadow-platinum-glow text-[10px] tracking-widest">
             <Activity size={16} className="mr-2" /> Report Executivo
           </button>
        </div>
      </header>
      
      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div className="platinum-card p-10 group bg-surface-elevated/10 backdrop-blur-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-platinum-glow-sm">
              <Award size={28} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Neural Success</span>
              <div className="flex items-center text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 mt-2 shadow-platinum-glow-sm">
                <ArrowUpRight size={12} className="mr-2" /> +12.4%
              </div>
            </div>
          </div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] mb-2 text-text-muted">Taxa de Conversão Master</h2>
          <div className="flex items-baseline gap-4 relative z-10">
            <span className="text-5xl font-black text-gradient-gold tracking-tighter">{winRate?.rate}%</span>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 relative z-10">
            <div className="p-4 bg-background/50 rounded-2xl border border-border-subtle shadow-inner-platinum">
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Ganhos Reais</p>
              <p className="text-lg font-black text-emerald-500">{winRate?.won}</p>
            </div>
            <div className="p-4 bg-background/50 rounded-2xl border border-border-subtle shadow-inner-platinum">
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Impacto Perda</p>
              <p className="text-lg font-black text-red-500/60">{winRate?.lost}</p>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 blur-[50px] rounded-full group-hover:bg-primary/10 transition-all duration-700" />
        </div>

        <div className="platinum-card p-10 group bg-surface-elevated/10 backdrop-blur-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-500 shadow-platinum-glow-sm">
              <DollarSign size={28} />
            </div>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Global Assets</span>
          </div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] mb-2 text-text-muted">Volume Total Pipeline</h2>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-4xl font-black text-text-primary tracking-tighter group-hover:text-primary transition-colors">
              {formatCurrency(pipeline.reduce((acc, curr) => acc + curr.value, 0))}
            </span>
          </div>
          <p className="mt-8 text-[10px] text-text-secondary font-bold uppercase tracking-widest leading-relaxed opacity-60 italic border-l-2 border-secondary/30 pl-4">
            Total bruto das oportunidades ativas em estágio de qualificação e análise RPA.
          </p>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-secondary/5 blur-[50px] rounded-full group-hover:bg-secondary/10 transition-all duration-700" />
        </div>

        <div className="platinum-card p-10 group bg-surface-elevated/10 backdrop-blur-xl relative overflow-hidden">
           <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-500 shadow-platinum-glow-sm">
              <PieChart size={28} />
            </div>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Deep Intelligence</span>
          </div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] mb-2 text-text-muted">Participações RPA Ativas</h2>
          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-5xl font-black text-text-primary tracking-tighter group-hover:text-accent transition-colors">
              {pipeline.reduce((acc, curr) => acc + curr.count, 0)}
            </span>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Oportunidades</span>
          </div>
          <div className="mt-10 flex items-center gap-2 relative z-10">
             {pipeline.map((p, i) => (
               <div key={i} className="h-2 rounded-full transition-all hover:h-4 cursor-help shadow-platinum-glow-sm" style={{ width: `${(p.count / pipeline.reduce((a,c) => a+c.count, 0)) * 100}%`, backgroundColor: p.color || '#6366f1' }} title={`${p.name}: ${p.count}`} />
             ))}
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-accent/5 blur-[50px] rounded-full group-hover:bg-accent/10 transition-all duration-700" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="platinum-card p-10 space-y-10 bg-surface-elevated/10 backdrop-blur-xl">
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-primary flex items-center gap-4 border-b border-border-subtle/30 pb-6">
            <div className="w-1.5 h-6 bg-primary rounded-full shadow-platinum-glow" />
            Fluxo Neural por Etapa (Valuation)
          </h3>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 900 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 900 }}
                  tickFormatter={(val) => `R$ ${(val/1000)}k`}
                />
                <Tooltip 
                  cursor={{ stroke: '#2563eb', strokeWidth: 2 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    border: '1px solid var(--color-border-medium)', 
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-platinum)',
                    fontSize: '11px',
                    fontWeight: 'black',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-primary)',
                    padding: '16px'
                  }} 
                  itemStyle={{ color: 'var(--color-primary)' }}
                  formatter={(value: number) => [formatCurrency(value), 'VALUATION']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="url(#colorValue)" 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="platinum-card p-10 space-y-10 bg-surface-elevated/10 backdrop-blur-xl">
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-primary flex items-center gap-4 border-b border-border-subtle/30 pb-6">
            <div className="w-1.5 h-6 bg-secondary rounded-full shadow-platinum-glow" />
            Top Órgãos Licitantes (Target)
          </h3>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topOrgs} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border-subtle)" opacity={0.5} />
                <XAxis 
                  type="number" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 900 }}
                  tickFormatter={(val) => `R$ ${(val/1000)}k`}
                  dy={15}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={140} 
                  tick={{fontSize: 9, fill: 'var(--color-text-primary)', fontWeight: 900, textTransform: 'uppercase'}} 
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-surface-elevated)', opacity: 0.2 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    border: '1px solid var(--color-border-medium)', 
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-platinum)',
                    fontSize: '11px',
                    fontWeight: 'black',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-primary)',
                    padding: '16px'
                  }}
                  itemStyle={{ color: 'var(--color-secondary)' }}
                  formatter={(value: number) => [formatCurrency(value), 'TOTAL OPPORTUNITY']}
                />
                <Bar 
                  dataKey="total_value" 
                  radius={[0, 12, 12, 0]} 
                  barSize={20}
                  className="transition-all duration-500 cursor-pointer"
                >
                  {topOrgs.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#14b8a6'} fillOpacity={1 - index * 0.15} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
