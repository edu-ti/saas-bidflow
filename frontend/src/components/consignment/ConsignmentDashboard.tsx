import { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, CheckCircle, Loader2, Search, Zap, Filter, ArrowRight, Trash2, Plus, Clock } from 'lucide-react';
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
    { label: 'Exposição em Campo', value: fmt(stats.total_active_value), icon: DollarSign, color: 'text-primary' },
    { label: 'Acertos Pendentes', value: stats.pending_reconcile_count, icon: AlertTriangle, color: 'text-amber-500' },
    { label: 'Ciclos Concluídos', value: stats.total_closed_count, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Status da Rede', value: 'Operacional', icon: Zap, color: 'text-primary' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map(({ label, value, icon: Icon, color }, i) => (
          <div key={i} className="platinum-card p-6 flex flex-col gap-4 group hover:border-primary/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{label}</p>
              <p className="text-xl font-black text-white mt-1 tracking-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Center */}
      <div className="platinum-card p-6 flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="flex flex-1 gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              id="search-consignment"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Pesquisar por consignatário ou ID..."
              className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 rounded-xl text-sm text-white focus:border-primary/30 outline-none transition-all placeholder:text-text-muted"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <select
              id="filter-status"
              value={filterStatus}
              onChange={e => onFilterChange(e.target.value)}
              className="pl-11 pr-10 py-3 bg-background border border-white/5 rounded-xl text-sm text-white focus:border-primary/30 outline-none transition-all appearance-none"
            >
              <option value="" className="bg-surface">Todos Status</option>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v} className="bg-surface">{l}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          id="btn-nova-consignacao"
          onClick={onOpenWizard}
          className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-[10px] tracking-widest"
        >
          <Plus className="w-4 h-4" />
          Nova Remessa
        </button>
      </div>

      {/* Main Ledger */}
      <div className="platinum-card overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Registro Geral de Consignações</h3>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest italic">Monitoramento de ativos em posse de terceiros</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 animate-pulse">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Sincronizando Ledger...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                <DollarSign size={40} className="text-primary" />
              </div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Nenhuma remessa encontrada no ciclo atual</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">ID</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Consignatário</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Status Atual</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Valuation</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Prazos</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6 font-mono text-[10px] text-primary font-black">#{r.id}</td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-white group-hover:text-primary transition-colors uppercase text-xs">{r.consignee?.name ?? 'Não identificado'}</div>
                      <div className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">{r.items?.length ?? 0} ITENS VINCULADOS</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS_PLATINUM[r.status] || 'bg-white/5 text-text-muted border-white/10'}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-white text-xs">{fmt(r.total_value)}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[9px] text-text-muted font-bold uppercase tracking-widest">
                          <Clock size={10} className="text-primary/60" /> Emissão: {fmtDate(r.issue_date)}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-text-muted font-bold uppercase tracking-widest">
                          <Zap size={10} className="text-amber-500/60" /> Vecto: {fmtDate(r.due_date)}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-3">
                        {r.status === 'active' && (
                          <>
                            <button
                              onClick={() => onOpenReconcile(r)}
                              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-primary/20 hover:text-background"
                            >
                              Acertar <ArrowRight size={12} />
                            </button>
                            <button
                              onClick={() => onDelete(r.id)}
                              className="p-2 text-text-muted hover:text-red-400 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
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
