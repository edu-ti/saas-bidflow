import { useState, useEffect } from 'react';
import { Loader2, Check, AlertTriangle, ShieldCheck, Zap, Info, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import Modal from '../ui/Modal';
import type { ConsignmentRecord, ReconcileItem } from './types';

interface Props {
  isOpen: boolean;
  consignment: ConsignmentRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReconcileModal({ isOpen, consignment, onClose, onSuccess }: Props) {
  const [rows, setRows] = useState<ReconcileItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!consignment) return;
    setRows(consignment.items.map(i => ({
      item_id: i.id,
      qty_sold: i.qty_sold,
      qty_returned: i.qty_returned,
    })));
  }, [consignment]);

  const handleSave = async () => {
    if (!consignment) return;
    setSaving(true);
    try {
      const payload = {
        sold_items: rows.map((r, i) => ({ 
          product_id: consignment.items[i].product_id, 
          quantity: r.qty_sold 
        })),
        returned_items: rows.map((r, i) => ({ 
          product_id: consignment.items[i].product_id, 
          quantity: r.qty_returned 
        }))
      };
      await api.post(`/api/consignments/${consignment.id}/reconcile`, payload);
      toast.success('Acerto consolidado! Faturamento processado.');
      onSuccess();
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(', ')
        : e?.response?.data?.message || 'Erro na conciliação operacional';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const updateRow = (idx: number, field: 'qty_sold' | 'qty_returned', value: number) => {
    const copy = [...rows];
    copy[idx] = { ...copy[idx], [field]: Math.max(0, value) };
    setRows(copy);
  };

  if (!consignment) return null;

  const hasOver = rows.some((r, i) => (r.qty_sold + r.qty_returned) > consignment.items[i].qty_sent);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`PRESTAÇÃO DE CONTAS – REMESSA #${consignment.id}`} size="lg">
      <div className="p-2 space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Consignatário Designado</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">{consignment.consignee?.name}</h3>
            <div className="text-right">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block">Valuation Original</span>
              <span className="text-sm font-black text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(consignment.total_value))}</span>
            </div>
          </div>
        </header>

        <div className="platinum-card overflow-hidden border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-4 py-4 font-black uppercase text-[10px] tracking-widest text-text-muted">Ativo</th>
                <th className="px-4 py-4 font-black uppercase text-[10px] tracking-widest text-text-muted text-center">Remetido</th>
                <th className="px-4 py-4 font-black uppercase text-[10px] tracking-widest text-text-muted text-center">Vendido</th>
                <th className="px-4 py-4 font-black uppercase text-[10px] tracking-widest text-text-muted text-center">Devolvido</th>
                <th className="px-4 py-4 font-black uppercase text-[10px] tracking-widest text-text-muted text-center">Balanço</th>
                <th className="px-4 py-4 font-black uppercase text-[10px] tracking-widest text-text-muted text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {consignment.items.map((item, idx) => {
                const row = rows[idx];
                if (!row) return null;
                const pending = item.qty_sent - row.qty_sold - row.qty_returned;
                const over = (row.qty_sold + row.qty_returned) > item.qty_sent;
                const done = pending === 0 && !over;

                return (
                  <tr key={item.id} className={`hover:bg-white/[0.01] transition-colors ${over ? 'bg-red-500/5' : ''}`}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Package size={12} className="text-primary/60" />
                        <div className="font-black text-[10px] text-white uppercase truncate max-w-[150px]">{item.product?.name ?? `Item #${item.product_id}`}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-xs font-bold text-text-secondary">{item.qty_sent}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <input type="number" min={0} max={item.qty_sent}
                          value={row.qty_sold}
                          onChange={e => updateRow(idx, 'qty_sold', parseInt(e.target.value) || 0)}
                          className={`w-16 text-center bg-background border rounded-lg py-1.5 text-xs text-white focus:border-primary/40 outline-none transition-all ${over ? 'border-red-500 ring-1 ring-red-500/20' : 'border-white/10'}`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <input type="number" min={0} max={item.qty_sent}
                          value={row.qty_returned}
                          onChange={e => updateRow(idx, 'qty_returned', parseInt(e.target.value) || 0)}
                          className={`w-16 text-center bg-background border rounded-lg py-1.5 text-xs text-white focus:border-primary/40 outline-none transition-all ${over ? 'border-red-500 ring-1 ring-red-500/20' : 'border-white/10'}`}
                        />
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-center font-black text-xs ${pending > 0 ? 'text-amber-500' : pending === 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                      {over ? 'EXCESSO!' : pending}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {done ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                          <Check size={10} /> CONCLUÍDO
                        </span>
                      ) : over ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-400 text-[9px] font-black uppercase tracking-widest border border-red-500/20 animate-pulse">
                          <AlertTriangle size={10} /> ERRO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                          <Zap size={10} className="animate-pulse" /> PENDENTE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {hasOver && (
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-relaxed">
              Inconsistência detectada: a somatória de unidades vendidas e devolvidas excede a remessa original. Verifique os inputs.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start gap-4">
            <Info size={18} className="text-primary mt-1 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Inteligência Fiscal</h4>
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest leading-relaxed">
                A devolução de ativos gera automaticamente um rascunho de NF-e (CFOP Devolução) no motor financeiro para fins de compliance.
              </p>
            </div>
          </div>
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start gap-4">
            <ShieldCheck size={18} className="text-emerald-400 mt-1 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Geração de Receita</h4>
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest leading-relaxed">
                As unidades marcadas como vendidas serão convertidas em títulos de faturamento na tesouraria contra o consignatário.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
          <button onClick={onClose}
            className="px-8 py-4 text-[10px] font-black text-text-muted hover:text-white uppercase tracking-widest transition-all"
          >
            Abortar
          </button>
          <button onClick={handleSave} disabled={saving || hasOver}
            className="px-10 py-4 bg-primary text-background text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary-hover transition-all shadow-platinum-glow flex items-center gap-2 disabled:opacity-20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck size={16} />}
            Consolidar Acerto
          </button>
        </div>
      </div>
    </Modal>
  );
}
