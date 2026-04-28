import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Clock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import { useTheme } from '../../context/ThemeContext';
import type { DashboardStats, ConsignmentRecord } from './types';
import { fmt, fmtDate, STATUS_LABELS, STATUS_COLORS } from './types';

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
  onOpenWizard, onOpenReconcile, onSend, onClose, onDelete,
  records, loading, search, onSearchChange, filterStatus, onFilterChange,
}: Props) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [stats, setStats] = useState<DashboardStats>({ totalRua: 0, vencendoHoje: 0, pendentes: 0, totalClosed: 0 });

  useEffect(() => {
    api.get('/api/consignments/dashboard-stats')
      .then(r => setStats(r.data.data))
      .catch(() => {});
  }, [records]);

  const card = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const sub = dark ? 'text-slate-400' : 'text-slate-500';
  const th = dark ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-50 text-slate-600';
  const tr = dark ? 'border-slate-700 hover:bg-slate-700/40' : 'border-slate-100 hover:bg-slate-50/60';
  const input = dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900';

  const kpis = [
    { label: 'Total na Rua', value: fmt(stats.totalRua), icon: DollarSign, color: 'text-blue-400', bg: dark ? 'bg-blue-500/10' : 'bg-blue-50' },
    { label: 'Vencendo Hoje', value: stats.vencendoHoje, icon: Clock, color: 'text-amber-400', bg: dark ? 'bg-amber-500/10' : 'bg-amber-50' },
    { label: 'Pendentes de Acerto', value: stats.pendentes, icon: AlertTriangle, color: 'text-orange-400', bg: dark ? 'bg-orange-500/10' : 'bg-orange-50' },
    { label: 'Fechadas', value: stats.totalClosed, icon: CheckCircle, color: 'text-emerald-400', bg: dark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
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
              <p className="text-xl font-bold mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + New */}
      <div className={`rounded-xl border p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center ${card}`}>
        <input
          id="search-consignment"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Buscar por consignatário..."
          className={`flex-1 w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
        />
        <select
          id="filter-status"
          value={filterStatus}
          onChange={e => onFilterChange(e.target.value)}
          className={`px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <button
          id="btn-nova-consignacao"
          onClick={onOpenWizard}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-blue-500/20 whitespace-nowrap"
        >
          + Nova Remessa
        </button>
      </div>

      {/* Table */}
      <div className={`rounded-xl border overflow-hidden ${card}`}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : records.length === 0 ? (
          <div className={`py-20 text-center ${sub}`}>
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhuma consignação encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={th}>
                  <th className="px-4 py-3 text-left text-xs uppercase font-semibold tracking-wide">ID</th>
                  <th className="px-4 py-3 text-left text-xs uppercase font-semibold tracking-wide">Consignatário</th>
                  <th className="px-4 py-3 text-left text-xs uppercase font-semibold tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs uppercase font-semibold tracking-wide">Valor</th>
                  <th className="px-4 py-3 text-left text-xs uppercase font-semibold tracking-wide">Emissão</th>
                  <th className="px-4 py-3 text-left text-xs uppercase font-semibold tracking-wide">Vencimento</th>
                  <th className="px-4 py-3 text-left text-xs uppercase font-semibold tracking-wide">Itens</th>
                  <th className="px-4 py-3 text-right text-xs uppercase font-semibold tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className={dark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-100'}>
                {records.map(r => (
                  <tr key={r.id} className={`transition-colors ${tr}`}>
                    <td className="px-4 py-3 font-mono text-xs">#{r.id}</td>
                    <td className="px-4 py-3 font-medium">{r.consignee?.name ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-500">{fmt(r.total_value)}</td>
                    <td className="px-4 py-3">{fmtDate(r.issue_date)}</td>
                    <td className="px-4 py-3">{fmtDate(r.due_date)}</td>
                    <td className="px-4 py-3 text-center">{r.items?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status === 'draft' && (
                          <>
                            <button onClick={() => onSend(r)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition-colors">
                              Enviar
                            </button>
                            <button onClick={() => onDelete(r.id)} className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs rounded-lg font-medium transition-colors">
                              Excluir
                            </button>
                          </>
                        )}
                        {(r.status === 'sent' || r.status === 'partially_returned') && (
                          <>
                            <button onClick={() => onOpenReconcile(r)} className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs rounded-lg font-medium transition-colors">
                              Acertar
                            </button>
                            <button onClick={() => onClose(r)} className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg font-medium transition-colors">
                              Fechar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
