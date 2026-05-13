import { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, CheckCircle, Loader2, Search, Zap, Filter, ArrowRight, Trash2, Plus, Clock, TrendingUp, ShieldCheck, Activity, ChevronRight, Layout, Database } from 'lucide-react';
import api from '../../lib/axios';
import type { DashboardStats, ConsignmentRecord } from './types';
import { fmt, fmtDate, STATUS_LABELS, STATUS_COLORS } from './types';
import { Select } from '../ui/Select';

interface Props {
 onOpenWizard: () => void;
 onOpenReconcile: (c: ConsignmentRecord) => void;
 onSend: (c: ConsignmentRecord) => void;
 onClose: (c: ConsignmentRecord) => void;
 onDelete: (id: number) => void;
 records: ConsignmentRecord[];
 loading: boolean;
 search: string;
 onSearchChange: (s: string) => void;
 filterStatus: string;
 onFilterChange: (s: string) => void;
 canCreate?: boolean;
 canSend?: boolean;
 canClose?: boolean;
 canDelete?: boolean;
}

export default function ConsignmentDashboard({
 onOpenWizard, onOpenReconcile, onSend, onClose, onDelete, records, loading, search, onSearchChange, filterStatus, onFilterChange,
 canCreate, canSend, canClose, canDelete,
}: Props) {
 const [stats, setStats] = useState<DashboardStats>({ total_active_value: 0, pending_reconcile_count: 0, total_closed_count: 0 });

 useEffect(() => {
 api.get('/api/consignments/dashboard-stats')
.then(r => setStats(r.data.data))
.catch(() => {});
 }, [records]);

 const kpis = [
 { label: 'Exposição em Campo', value: fmt(stats.total_active_value), icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
 { label: 'Acertos Pendentes', value: stats.pending_reconcile_count, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
 { label: 'Ciclos Concluídos', value: stats.total_closed_count, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
 { label: 'Status Operacional', value: 'Active Core', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
 ];

 return (
 <div className="space-y-10 animate-in fade-in duration-700">
 {/* KPI Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 {kpis.map(({ label, value, icon: Icon, color, bg }, i) => (
 <div key={i} className="card p-8 flex flex-col gap-8 group hover:border-primary/40 transition-all duration-500 bg-bg-tertiary/10 backdrop-blur-xl border-border/30 overflow-hidden relative">
 <div className={`w-16 h-16 rounded-xl ${bg} border border-border flex items-center justify-center group-hover:scale-110 transition-transform duration-500 relative z-10`}>
 <Icon className={`w-8 h-8 ${color} group-hover: transition-all`} />
 </div>
 <div className="relative z-10">
 <p className="text-xs font-semibold uppercase text-text-muted opacity-60">{label}</p>
 <p className="text-2xl font-semibold text-text-primary mt-3 tracking-tight group-hover:text-primary transition-colors duration-500">{value}</p>
 </div>
 <div className={`absolute -right-4 -bottom-4 w-32 h-32 ${bg} blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity duration-700`} />
 </div>
 ))}
 </div>

 {/* Control Center */}
 <div className="card p-8 flex flex-col lg:flex-row gap-8 items-center justify-between bg-bg-tertiary/10 backdrop-blur-xl border-border/30 ">
 <div className="flex flex-col md:flex-row flex-1 gap-6 w-full">
 <div className="relative flex-1 group">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
 <input
 id="search-consignment"
 value={search}
 onChange={e => onSearchChange(e.target.value)}
 placeholder="Interrogar por consignatário ou identificação digital..."
 className="w-full pl-16 pr-6 py-4 bg-background/50 border border-border rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 "
 />
 </div>
 <div className="relative group min-w-[240px] z-20">
 <Filter size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
 <Select
 value={filterStatus}
 onChange={onFilterChange}
 options={[
 { value: '', label: 'Filtro de Estado' },
...Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l.toUpperCase() }))
 ]}
 className="pl-14"
 />
 </div>
 </div>
  {canCreate && (
  <button
  id="btn-nova-consignacao"
  onClick={onOpenWizard}
  className="btn btn-primary py-5 px-12 w-full lg:w-auto uppercase text-sm tracking-widest flex items-center justify-center gap-4"
  >
  <Plus className="w-6 h-6" />
  Registrar Remessa Neural
  </button>
  )}
 </div>

 {/* Main Ledger */}
 <div className="card overflow-hidden bg-bg-tertiary/10 backdrop-blur-md border-border/30 ">
 <div className="p-10 border-b border-border/30 bg-bg-tertiary/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
 <div className="space-y-2">
 <h3 className="text-sm font-semibold text-text-primary uppercase flex items-center gap-3">
 <div className="w-1.5 h-6 bg-primary rounded-full " />
 Registro Geral de Consignações Core
 </h3>
 <p className="text-xs text-text-muted font-semibold uppercase tracking-widest opacity-60 flex items-center gap-2">
 <ShieldCheck size={14} className="text-primary" /> Auditoria distribuída de ativos sob custódia
 </p>
 </div>
 <div className="px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-semibold text-emerald-500 uppercase tracking-widest animate-pulse flex items-center gap-3">
 <Database size={14} /> System Encrypted Ledger
 </div>
 </div>

 <div className="overflow-x-auto ">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-40 gap-8">
 <Loader2 className="w-14 h-14 animate-spin text-primary opacity-40" />
 <p className="text-xs font-semibold text-text-muted uppercase animate-pulse">Sincronizando Ledger Global...</p>
 </div>
 ) : records.length === 0 ? (
 <div className="py-40 text-center space-y-8">
 <div className="w-28 h-28 bg-bg-tertiary/40 border border-border rounded-xl flex items-center justify-center mx-auto opacity-30 ">
 <DollarSign size={54} className="text-primary" />
 </div>
 <p className="text-xs font-semibold text-text-muted uppercase opacity-40">Nenhuma remessa ativa localizada no grid estratégico</p>
 </div>
 ) : (
 <table className="w-full text-left text-sm">
 <thead className="bg-bg-tertiary/40 border-b border-border">
 <tr>
 <th className="px-10 py-6 font-semibold uppercase text-xs text-text-muted opacity-60">ID / Hash</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs text-text-muted opacity-60">Consignatário Estratégico</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs text-text-muted opacity-60 text-center">Status do Ciclo</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs text-text-muted opacity-60">Valuation Net</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs text-text-muted opacity-60">Prazos e SLAs</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs text-text-muted opacity-60 text-right">Controles Core</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/20">
 {records.map(r => (
 <tr key={r.id} className="hover:bg-bg-tertiary/20 transition-all group border-b border-border/10 duration-500">
 <td className="px-10 py-10 font-semibold text-[12px] text-primary group-hover:scale-110 transition-transform origin-left font-mono">#{r.id.toString().padStart(6, '0')}</td>
 <td className="px-10 py-10">
 <div className="font-semibold text-text-primary group-hover:text-primary transition-colors uppercase text-sm tracking-tight">{r.consignee?.name ?? 'Identidade Não Localizada'}</div>
 <div className="text-xs text-text-muted font-semibold uppercase tracking-widest mt-3 opacity-60 flex items-center gap-3">
 <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" /> {r.items?.length ?? 0} Ativos em Custódia
 </div>
 </td>
 <td className="px-10 py-10">
 <div className="flex justify-center">
  <span className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border backdrop-blur-md transition-all group-hover:scale-105 ${STATUS_COLORS[r.status] || 'bg-bg-tertiary/40 text-text-muted border-border'}`}>
 <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
 {STATUS_LABELS[r.status]}
 </span>
 </div>
 </td>
 <td className="px-10 py-10 font-semibold text-text-primary text-base tracking-tight group-hover:text-primary transition-colors">{fmt(r.total_value)}</td>
 <td className="px-10 py-10">
 <div className="flex flex-col gap-3">
 <div className="flex items-center gap-3 text-xs text-text-muted font-semibold uppercase tracking-widest opacity-60">
 <Clock size={14} className="text-primary/60" /> {fmtDate(r.issue_date)}
 </div>
 <div className="flex items-center gap-3 text-xs text-text-primary font-semibold uppercase tracking-widest">
 <Zap size={14} className="text-amber-500" /> {fmtDate(r.due_date)}
 </div>
 </div>
 </td>
 <td className="px-10 py-10 text-right">
 <div className="flex items-center justify-end gap-5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-6 group-hover:translate-x-0">
  {r.status === 'active' && (
  <>
  <button
  onClick={() => onOpenReconcile(r)}
  className="flex items-center gap-3 px-8 py-3.5 bg-primary/10 text-primary hover:bg-primary text-xs font-semibold uppercase tracking-widest rounded-xl transition-all border border-primary/20 hover:text-white group/btn"
  >
  Acertar Ciclo <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
  </button>
  {canDelete && (
  <button
  onClick={() => onDelete(r.id)}
  className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/20 text-red-500/60 hover:text-red-500 transition-all hover:scale-110 "
  title="Arquivar Registro"
  >
  <Trash2 size={20} />
  </button>
  )}
  </>
  )}
 <button className="p-4 bg-bg-tertiary/40 border border-border rounded-xl text-text-muted hover:text-primary transition-all hover:scale-110">
 <Layout size={20} />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 </div>
 </div>
 );
}
