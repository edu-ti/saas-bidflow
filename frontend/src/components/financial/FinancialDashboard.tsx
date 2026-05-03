import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, ArrowUpRight, ArrowDownRight, Loader2, ShieldCheck, Zap, BarChart3, AlertCircle, Target, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../lib/axios';

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
  const [data, setData] = useState<CashFlowData | null>(null);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [errorInvoices, setErrorInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/financial/cash-flow', { params: { period: 'month' } }),
      api.get('/api/financial/bank-accounts'),
      api.get('/api/financial/invoices?status=cancelled')
    ]).then(([flowRes, banksRes, invRes]) => {
      setData(flowRes.data.data);
      setBankAccounts(banksRes.data.data || []);
      setErrorInvoices(invRes.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const chartData = data ? Object.entries(data.monthly_flow).map(([month, val]) => ({
    name: MONTHS[parseInt(month) - 1] || month,
    Entradas: val.entries,
    Saídas: val.exits,
    Saldo: val.entries - val.exits,
  })) : [];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Orquestrando Fluxo Financeiro...</span>
    </div>
  );

  const totalBalance = bankAccounts.reduce((acc, b) => acc + Number(b.current_balance || 0), 0);

  const kpis = [
    { label: 'Liquidez em Conta', value: fmt(totalBalance), icon: Wallet, color: 'text-primary', trend: null },
    { label: 'Projeção de Entradas', value: fmt(data?.pending_entries || 0), icon: TrendingUp, color: 'text-emerald-400', trend: 'Inflow' },
    { label: 'Compromissos Pendentes', value: fmt(data?.pending_exits || 0), icon: TrendingDown, color: 'text-red-400', trend: 'Outflow' },
    { label: 'VPL Projetado (30D)', value: fmt(totalBalance + (data?.pending_entries || 0) - (data?.pending_exits || 0)), icon: Target, color: 'text-white', trend: 'Strategic' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Treasury & <span className="text-gradient-gold">Cash Intelligence</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary" />
            Visibilidade 360º de liquidez, obrigações e performance fiscal.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Última Conciliação</span>
            <span className="text-xs font-bold text-white uppercase tracking-tighter">Hoje, {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <Zap className="text-primary w-5 h-5 animate-pulse" />
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="platinum-card p-6 flex flex-col gap-4 group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              {trend && (
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted border border-white/10 px-2 py-1 rounded-md">{trend}</span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{label}</p>
              <p className="text-xl font-black text-white mt-1 tracking-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Projection Chart */}
        <div className="lg:col-span-8 platinum-card p-8 space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Fluxo de Caixa Preditivo</h3>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Horizonte operacional de 30 dias</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Inflows</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Outflows</span>
              </div>
            </div>
          </div>
          
          <div className="h-[340px] -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900 }} 
                  tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} 
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                  labelStyle={{ fontSize: '10px', fontWeight: 900, marginBottom: '8px', color: '#64748b' }}
                  formatter={(value: number) => [fmt(value)]}
                />
                <Bar dataKey="Entradas" fill="#10b981" radius={[6,6,0,0]} barSize={32} />
                <Bar dataKey="Saídas" fill="#ef4444" radius={[6,6,0,0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Monitor / Alerta Fiscal */}
        <div className="lg:col-span-4 platinum-card overflow-hidden flex flex-col">
          <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle size={16} className="text-red-400" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Monitor de Risco Fiscal</h3>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar">
            {errorInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-4 opacity-40">
                <ShieldCheck size={40} className="text-emerald-400" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Integridade fiscal mantida</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <tbody className="divide-y divide-white/5">
                  {errorInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-5 space-y-1">
                        <div className="font-black text-xs text-white uppercase group-hover:text-red-400 transition-colors">NF-e #{inv.number || '---'}</div>
                        <div className="text-[9px] text-text-muted font-bold truncate max-w-[140px] uppercase tracking-widest">{inv.recipient_name}</div>
                      </td>
                      <td className="px-6 py-5 text-right space-y-1">
                        <div className="font-black text-xs text-white">{fmt(inv.total_value)}</div>
                        <span className="text-[8px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest inline-block">Transmission Error</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-4 bg-white/[0.01] border-t border-white/5">
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <BarChart3 size={12} /> Diagnóstico Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
