import { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, CheckCircle, Loader2, Search, Zap, Filter, ArrowRight, Trash2, Plus, Clock, TrendingUp, ShieldCheck, Activity, ChevronRight, Layout, Database } from 'lucide-react';
import api from '../../lib/axios';
import type { DashboardStats, ConsignmentRecord } from './types';
import { fmt, fmtDate, STATUS_LABELS, STATUS_COLORS_PLATINUM } from './types';

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
}

export default function ConsignmentDashboard({
  onOpenWizard, onOpenReconcile, onSend, onClose, onDelete, records, loading, search, onSearchChange, filterStatus, onFilterChange,
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
          <div key={i} className="platinum-card p-8 flex flex-col gap-8 group hover:border-primary/40 transition-all duration-500 bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 shadow-platinum-glow-sm overflow-hidden relative">
            <div className={`w-16 h-16 rounded-[1.5rem] ${bg} border border-border-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner-platinum relative z-10`}>
              <Icon className={`w-8 h-8 ${color} group-hover:shadow-platinum-glow-sm transition-all`} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-60">{label}</p>
              <p className="text-2xl font-black text-text-primary mt-3 tracking-tighter group-hover:text-primary transition-colors duration-500">{value}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-32 h-32 ${bg} blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity duration-700`} />
          </div>
        ))}
      </div>

      {/* Control Center */}
      <div className="platinum-card p-8 flex flex-col lg:flex-row gap-8 items-center justify-between bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 shadow-platinum-glow-sm">
        <div className="flex flex-col md:flex-row flex-1 gap-6 w-full">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              id="search-consignment"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Interrogar por consignatário ou identificação digital..."
              className="w-full pl-16 pr-6 py-4.5 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
            />
          </div>
          <div className="relative group min-w-[240px]">
            <Filter size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
            <select
              id="filter-status"
              value={filterStatus}
              onChange={e => onFilterChange(e.target.value)}
              className="w-full pl-16 pr-12 py-4.5 bg-background/50 border border-border-medium rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
            >
              <option value="" className="bg-surface">Filtro de Estado</option>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v} className="bg-surface font-black">{l.toUpperCase()}</option>
              ))}
            </select>
            <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40 pointer-events-none" />
          </div>
        </div>
        <button
          id="btn-nova-consignacao"
          onClick={onOpenWizard}
          className="btn-primary py-5 px-12 shadow-platinum-glow w-full lg:w-auto uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-4"
        >
          <Plus className="w-6 h-6" />
          Registrar Remessa Neural
        </button>
      </div>

      {/* Main Ledger */}
      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
        <div className="p-10 border-b border-border-subtle/30 bg-surface-elevated/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.4em] flex items-center gap-3">
               <div className="w-1.5 h-6 bg-primary rounded-full shadow-platinum-glow" />
               Registro Geral de Consignações Core
            </h3>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-60 flex items-center gap-2">
               <ShieldCheck size={14} className="text-primary" /> Auditoria distribuída de ativos sob custódia
            </p>
          </div>
          <div className="px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] animate-pulse shadow-platinum-glow-sm flex items-center gap-3">
             <Database size={14} /> System Encrypted Ledger
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-platinum">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-8">
              <Loader2 className="w-14 h-14 animate-spin text-primary opacity-40" />
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] animate-pulse">Sincronizando Ledger Global...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-40 text-center space-y-8">
              <div className="w-28 h-28 bg-surface-elevated/40 border border-border-subtle rounded-[2.5rem] flex items-center justify-center mx-auto opacity-30 shadow-inner-platinum">
                <DollarSign size={54} className="text-primary" />
              </div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] opacity-40">Nenhuma remessa ativa localizada no grid estratégico</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated/40 border-b border-border-subtle">
                <tr>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">ID / Hash</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Consignatário Estratégico</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-center">Status do Ciclo</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Valuation Net</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Prazos e SLAs</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-right">Controles Core</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/20">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/10 duration-500">
                    <td className="px-10 py-10 font-black text-[12px] text-primary group-hover:scale-110 transition-transform origin-left font-mono">#{r.id.toString().padStart(6, '0')}</td>
                    <td className="px-10 py-10">
                      <div className="font-black text-text-primary group-hover:text-primary transition-colors uppercase text-sm tracking-tight">{r.consignee?.name ?? 'Identidade Não Localizada'}</div>
                      <div className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] mt-3 opacity-60 flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" /> {r.items?.length ?? 0} Ativos em Custódia
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <div className="flex justify-center">
                        <span className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-platinum-glow-sm backdrop-blur-md transition-all group-hover:scale-105 ${STATUS_COLORS_PLATINUM[r.status] || 'bg-surface-elevated/40 text-text-muted border-border-subtle'}`}>
                          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                          {STATUS_LABELS[r.status]}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-10 font-black text-text-primary text-base tracking-tighter group-hover:text-primary transition-colors">{fmt(r.total_value)}</td>
                    <td className="px-10 py-10">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-60">
                          <Clock size={14} className="text-primary/60" /> {fmtDate(r.issue_date)}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-text-primary font-black uppercase tracking-[0.3em]">
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
                              className="flex items-center gap-3 px-8 py-3.5 bg-primary/10 text-primary hover:bg-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-xl transition-all border border-primary/20 hover:text-white shadow-platinum-glow-sm group/btn"
                            >
                              Acertar Ciclo <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                            <button
                              onClick={() => onDelete(r.id)}
                              className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/20 text-red-500/60 hover:text-red-500 transition-all hover:scale-110 shadow-inner-platinum"
                              title="Arquivar Registro"
                            >
                              <Trash2 size={20} />
                            </button>
                          </>
                        )}
                        <button className="p-4 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary transition-all shadow-inner-platinum hover:scale-110">
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
