import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../lib/axios';
import { useTheme } from '../../context/ThemeContext';

interface CashFlowData {
  total_entries: number;
  total_exits: number;
  pending_entries: number;
  pending_exits: number;
  paid_entries: number;
  paid_exits: number;
  balance: number;
  monthly_flow: Record<string, { entries: number; exits: number }>;
}

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function FinancialDashboard() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [data, setData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/financial/cash-flow', { params: { period: 'year' } })
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const card = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const sub = dark ? 'text-slate-400' : 'text-slate-500';

  const chartData = data ? Object.entries(data.monthly_flow).map(([month, val]) => ({
    name: MONTHS[parseInt(month) - 1] || month,
    Entradas: val.entries,
    Saídas: val.exits,
    Saldo: val.entries - val.exits,
  })) : [];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (!data) return <div className={`text-center py-20 ${sub}`}>Sem dados de fluxo de caixa</div>;

  const breakEven = data.total_entries > 0 ? ((data.total_exits / data.total_entries) * 100).toFixed(1) : '0';

  const kpis = [
    { label: 'Entradas Totais', value: fmt(data.total_entries), icon: TrendingUp, color: 'text-emerald-400', bg: dark ? 'bg-emerald-500/10' : 'bg-emerald-50', sub: ArrowUpRight },
    { label: 'Saídas Totais', value: fmt(data.total_exits), icon: TrendingDown, color: 'text-red-400', bg: dark ? 'bg-red-500/10' : 'bg-red-50', sub: ArrowDownRight },
    { label: 'Saldo Líquido', value: fmt(data.balance), icon: DollarSign, color: data.balance >= 0 ? 'text-blue-400' : 'text-red-400', bg: dark ? 'bg-blue-500/10' : 'bg-blue-50' },
    { label: 'Ponto de Equilíbrio', value: `${breakEven}%`, icon: Clock, color: 'text-amber-400', bg: dark ? 'bg-amber-500/10' : 'bg-amber-50' },
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl border p-5 flex items-center gap-4 transition-all hover:scale-[1.02] ${card}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className={`text-xs font-medium ${sub}`}>{label}</p>
              <p className="text-lg font-bold mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className={`rounded-xl border p-6 mb-6 ${card}`}>
        <h3 className="text-sm font-semibold mb-4">Fluxo de Caixa Mensal</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: dark ? '#94a3b8' : '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: dark ? '#94a3b8' : '#64748b' }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: dark ? '#1e293b' : '#fff', border: '1px solid ' + (dark ? '#334155' : '#e2e8f0'), borderRadius: '8px' }}
                labelStyle={{ color: dark ? '#e2e8f0' : '#1e293b' }}
                formatter={(value: number) => [fmt(value)]}
              />
              <Legend />
              <Bar dataKey="Entradas" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="Saídas" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-xl border p-5 ${card}`}>
          <h4 className="text-sm font-semibold mb-3 text-emerald-500">Entradas Pendentes</h4>
          <p className="text-2xl font-bold">{fmt(data.pending_entries)}</p>
          <p className={`text-xs mt-1 ${sub}`}>Recebido: {fmt(data.paid_entries)}</p>
        </div>
        <div className={`rounded-xl border p-5 ${card}`}>
          <h4 className="text-sm font-semibold mb-3 text-red-500">Saídas Pendentes</h4>
          <p className="text-2xl font-bold">{fmt(data.pending_exits)}</p>
          <p className={`text-xs mt-1 ${sub}`}>Pago: {fmt(data.paid_exits)}</p>
        </div>
      </div>
    </div>
  );
}
