import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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
        setPipeline(res.data.pipeline);
        setWinRate(res.data.win_rate);
        setTopOrgs(res.data.top_organizations);
      })
      .catch(err => console.error("Could not fetch stats", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-pulse text-primary font-medium">Carregando métricas estratégicas...</div>
    </div>
  );

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Performance <span className="text-gradient-gold">Estratégica</span>
        </h1>
        <p className="text-text-secondary max-w-prose-ui">
          Visão consolidada do pipeline de licitações e eficiência de conversão.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="platinum-card p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] mb-4 text-text-muted">Taxa de Vitória</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gradient-gold tracking-tighter">{winRate?.rate}%</span>
            <span className="text-sm text-text-muted">Win Rate</span>
          </div>
          <div className="mt-4 text-xs text-text-secondary flex gap-3">
            <span className="px-2 py-1 rounded-md bg-secondary/10 text-secondary border border-secondary/20 font-medium">{winRate?.won} ganhos</span>
            <span className="px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-medium">{winRate?.lost} perdas</span>
          </div>
        </div>

        <div className="platinum-card p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] mb-4 text-text-muted">Volume em Pipeline</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white tracking-tighter">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                maximumFractionDigits: 0
              }).format(pipeline.reduce((acc, curr) => acc + curr.value, 0))}
            </span>
          </div>
          <p className="mt-4 text-xs text-text-secondary">
            Valor total de oportunidades ativas em análise.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="platinum-card p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full" />
            Fluxo por Etapa
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `R$ ${(val/1000)}k`}
                />
                <Tooltip 
                  cursor={{ stroke: '#fbbf24', strokeWidth: 1 }}
                  contentStyle={{ 
                    backgroundColor: '#111827', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)'
                  }} 
                  formatter={(value: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Valor']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#fbbf24" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="platinum-card p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-secondary rounded-full" />
            Principais Clientes (Órgãos)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topOrgs} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  type="number" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `R$ ${(val/1000)}k`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={140} 
                  tick={{fontSize: 11, fill: '#f8fafc'}} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: '#111827', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    borderRadius: '12px'
                  }}
                  formatter={(value: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Valor Total']}
                />
                <Bar 
                  dataKey="total_value" 
                  fill="#fbbf24" 
                  radius={[0, 6, 6, 0]} 
                  barSize={20}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

