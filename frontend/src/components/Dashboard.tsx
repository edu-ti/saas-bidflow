import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../lib/axios';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
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

  if (loading) return <div className="p-8">Carregando métricas...</div>;

  const isDark = theme === 'dark';

  return (
    <div className={`p-8 w-full min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Performance Financeira</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-lg shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Win Rate</h2>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{winRate?.rate}% <span className={`text-xs font-normal block mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({winRate?.won} ganhos / {winRate?.lost} perdas)</span></p>
        </div>
        <div className={`p-6 rounded-lg shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total no Pipeline</h2>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pipeline.reduce((acc, curr) => acc + curr.value, 0))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-700'}`}>Valor Faturável por Etapa</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipeline} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#475569" : "#E2E8F0"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b' }} />
                <Tooltip formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: isDark ? '1px solid #475569' : '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-700'}`}>Top 5 Clientes (Órgãos Públicos)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topOrgs} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? "#475569" : "#E2E8F0"} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b'}} />
                <Tooltip formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: isDark ? '1px solid #475569' : '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Bar dataKey="total_value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
