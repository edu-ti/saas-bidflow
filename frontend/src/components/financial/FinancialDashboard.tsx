import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, ArrowUpRight, ArrowDownRight, Loader2, ShieldCheck, Zap, BarChart3, AlertCircle, Target, Wallet, Calendar, ChevronRight, Activity, Database } from 'lucide-react';
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
 <div className="flex flex-col items-center justify-center py-40 gap-6 animate-pulse">
 <div className="w-16 h-16 rounded-xl bg-bg-tertiary flex items-center justify-center border border-border ">
 <Loader2 className="w-8 h-8 animate-spin text-primary" />
 </div>
 <span className="text-xs font-semibold uppercase text-text-muted">Orquestrando Fluxo Financeiro Neural...</span>
 </div>
 );

 const totalBalance = bankAccounts.reduce((acc, b) => acc + Number(b.current_balance || 0), 0);

 const kpis = [
 { label: 'Liquidez em Conta', value: fmt(totalBalance), icon: Wallet, color: 'text-primary', trend: 'Auditada' },
 { label: 'Projeção de Entradas', value: fmt(data?.pending_entries || 0), icon: TrendingUp, color: 'text-emerald-500', trend: 'Inflow' },
 { label: 'Compromissos Pendentes', value: fmt(data?.pending_exits || 0), icon: TrendingDown, color: 'text-red-500', trend: 'Outflow' },
 { label: 'VPL Projetado (30D)', value: fmt(totalBalance + (data?.pending_entries || 0) - (data?.pending_exits || 0)), icon: Target, color: 'text-text-primary', trend: 'Strategic' },
 ];

 return (
 <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
 <div className="space-y-1">
 <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
 Treasury & <span className="text-primary">Cash Intelligence</span>
 </h1>
 <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
 <ShieldCheck size={14} className="text-primary" />
 Visibilidade 360º de liquidez, obrigações estratégicas e performance fiscal.
 </p>
 </div>
 <div className="flex items-center gap-4 bg-bg-tertiary/20 border border-border/30 p-5 rounded-3xl ">
 <div className="flex flex-col items-end">
 <span className="text-xs font-semibold uppercase tracking-widest text-text-muted opacity-60">Última Conciliação Bancária</span>
 <span className="text-xs font-semibold text-text-primary uppercase tracking-tight">Hoje, {new Date().toLocaleTimeString()}</span>
 </div>
 <div className="w-px h-10 bg-border-subtle/30 mx-2" />
 <Activity className="text-primary w-6 h-6 animate-pulse " />
 </div>
 </header>

 {/* KPI Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 {kpis.map(({ label, value, icon: Icon, color, trend }) => (
 <div key={label} className="card p-8 flex flex-col gap-6 group hover:border-primary/40 transition-all duration-500 bg-bg-tertiary/10 backdrop-blur-md">
 <div className="flex justify-between items-start">
 <div className="w-14 h-14 rounded-2xl bg-bg-tertiary/40 border border-border flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ">
 <Icon className={`w-7 h-7 ${color} group-hover: transition-all`} />
 </div>
 {trend && (
 <span className="text-xs font-semibold uppercase tracking-widest text-text-muted border border-border px-3 py-1.5 rounded-xl bg-bg-tertiary/40 ">{trend}</span>
 )}
 </div>
 <div>
 <p className="text-xs font-semibold uppercase text-text-muted opacity-60">{label}</p>
 <p className="text-2xl font-semibold text-text-primary mt-2 tracking-tight group-hover:text-primary transition-colors">{value}</p>
 </div>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 {/* Main Projection Chart */}
 <div className="lg:col-span-8 card p-10 space-y-10 bg-bg-tertiary/10 backdrop-blur-md border-border/30">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
 <div className="space-y-1">
 <h3 className="text-sm font-semibold text-text-primary uppercase tracking-widest flex items-center gap-3">
 <div className="w-1.5 h-5 bg-primary rounded-full " />
 Fluxo de Caixa Preditivo
 </h3>
 <p className="text-xs text-text-muted uppercase tracking-widest font-semibold opacity-60">Horizonte operacional estratégico (30 Dias)</p>
 </div>
 <div className="flex items-center gap-8">
 <div className="flex items-center gap-3">
 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 " />
 <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">Inflows Neural</span>
 </div>
 <div className="flex items-center gap-3">
 <div className="w-2.5 h-2.5 rounded-full bg-red-500 " />
 <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">Outflows RPA</span>
 </div>
 </div>
 </div>
 
 <div className="h-[380px] -ml-6">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={chartData} barGap={12}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.3} />
 <XAxis 
 dataKey="name" 
 axisLine={false} 
 tickLine={false} 
 tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 900 }} 
 />
 <YAxis 
 axisLine={false} 
 tickLine={false} 
 tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 900 }} 
 tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} 
 />
 <Tooltip
 cursor={{ fill: 'var(--color-surface-elevated)', opacity: 0.1 }}
 contentStyle={{ 
 backgroundColor: 'var(--color-surface)', 
 border: '1px solid var(--color-border-subtle)', 
 borderRadius: '24px', 
 boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
 padding: '20px'
 }}
 itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}
 labelStyle={{ fontSize: '11px', fontWeight: 900, marginBottom: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}
 formatter={(value: number) => [fmt(value)]}
 />
 <Bar dataKey="Entradas" fill="#10b981" radius={[8,8,0,0]} barSize={40} />
 <Bar dataKey="Saídas" fill="#ef4444" radius={[8,8,0,0]} barSize={40} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Risk Monitor / Alerta Fiscal */}
 <div className="lg:col-span-4 card overflow-hidden flex flex-col bg-bg-tertiary/10 backdrop-blur-md border-border/30">
 <div className="p-8 bg-bg-tertiary/20 border-b border-border/30 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 ">
 <AlertCircle size={20} className="text-red-500" />
 </div>
 <h3 className="text-xs font-semibold text-text-primary uppercase ">Monitor de Risco Fiscal</h3>
 </div>
 <Activity size={16} className="text-red-500/40 animate-pulse" />
 </div>
 
 <div className="flex-1 overflow-auto ">
 {errorInvoices.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-6 opacity-40">
 <div className="w-20 h-20 bg-bg-tertiary/40 rounded-xl flex items-center justify-center border border-border ">
 <ShieldCheck size={40} className="text-emerald-500 " />
 </div>
 <p className="text-xs font-semibold text-text-muted uppercase ">Integridade fiscal consolidada</p>
 </div>
 ) : (
 <table className="w-full text-left">
 <tbody className="divide-y divide-border/20">
 {errorInvoices.map(inv => (
 <tr key={inv.id} className="hover:bg-bg-tertiary/20 transition-all group duration-300">
 <td className="px-8 py-6 space-y-2">
 <div className="font-semibold text-xs text-text-primary uppercase group-hover:text-red-500 transition-colors tracking-tight">NF-e #{inv.number || 'SYNC_ERROR'}</div>
 <div className="text-xs text-text-muted font-semibold truncate max-w-[160px] uppercase tracking-widest opacity-60">{inv.recipient_name}</div>
 </td>
 <td className="px-8 py-6 text-right space-y-2">
 <div className="font-semibold text-xs text-text-primary tracking-tight">{fmt(inv.total_value)}</div>
 <span className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-xl uppercase tracking-widest ">Sefaz Error</span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 
 <div className="p-8 bg-bg-tertiary/10 border-t border-border/30">
 <button className="w-full py-4 bg-bg-tertiary/40 border border-border rounded-2xl text-xs font-semibold text-text-primary uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-3 group">
 <BarChart3 size={16} className="text-primary group-hover:scale-125 transition-transform" /> 
 Gerar Diagnóstico Estratégico
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
