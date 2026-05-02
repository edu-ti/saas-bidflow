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
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [errorInvoices, setErrorInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/financial/cash-flow', { params: { period: 'month' } }), // Prox 30 dias (mes)
      api.get('/api/financial/bank-accounts'),
      api.get('/api/financial/invoices?status=cancelled') // Simulate error invoices
    ]).then(([flowRes, banksRes, invRes]) => {
      setData(flowRes.data.data);
      setBankAccounts(banksRes.data.data || []);
      setErrorInvoices(invRes.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
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

  const totalBalance = bankAccounts.reduce((acc, b) => acc + Number(b.current_balance || 0), 0);

  const kpis = [
    { label: 'Saldo Atual (Contas)', value: fmt(totalBalance), icon: DollarSign, color: 'text-blue-400', bg: dark ? 'bg-blue-500/10' : 'bg-blue-50' },
    { label: 'A Receber Hoje', value: fmt(data.pending_entries / 30), icon: TrendingUp, color: 'text-emerald-400', bg: dark ? 'bg-emerald-500/10' : 'bg-emerald-50', sub: ArrowUpRight },
    { label: 'A Pagar Hoje', value: fmt(data.pending_exits / 30), icon: TrendingDown, color: 'text-red-400', bg: dark ? 'bg-red-500/10' : 'bg-red-50', sub: ArrowDownRight },
    { label: 'Saldo Projetado', value: fmt(totalBalance + data.pending_entries - data.pending_exits), icon: Clock, color: 'text-purple-400', bg: dark ? 'bg-purple-500/10' : 'bg-purple-50' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className={`lg:col-span-2 rounded-xl border p-6 ${card}`}>
          <h3 className="text-sm font-semibold mb-4">Fluxo de Caixa Projetado (30 dias)</h3>
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

        {/* Alerts Table */}
        <div className={`rounded-xl border overflow-hidden flex flex-col ${card}`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-sm text-red-500">Alertas: Notas Fiscais com Erro</h3>
          </div>
          <div className="flex-1 overflow-auto">
            {errorInvoices.length === 0 ? (
              <div className={`flex items-center justify-center h-full p-6 text-sm ${sub}`}>
                Nenhuma nota fiscal com erro.
              </div>
            ) : (
              <table className="w-full text-sm">
                <tbody className={dark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-100'}>
                  {errorInvoices.map(inv => (
                    <tr key={inv.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-xs">NF-e #{inv.number || 'S/N'}</div>
                        <div className={`text-xs mt-0.5 truncate max-w-[150px] ${sub}`}>{inv.recipient_name}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-xs text-red-500">{fmt(inv.total_value)}</div>
                        <div className="text-[10px] mt-0.5 text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full inline-block">Erro de Transmissão</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
