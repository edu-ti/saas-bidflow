import { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import Modal from '../ui/Modal';
import { useTheme } from '../../context/ThemeContext';
import type { ConsignmentRecord, ReconcileItem } from './types';

interface Props {
  isOpen: boolean;
  consignment: ConsignmentRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReconcileModal({ isOpen, consignment, onClose, onSuccess }: Props) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
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
      toast.success('Acerto realizado! Faturamento gerado.');
      onSuccess();
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(', ')
        : e?.response?.data?.message || 'Erro ao salvar';
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

  const input = dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900';
  const sub = dark ? 'text-slate-400' : 'text-slate-500';
  const cardBg = dark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Prestação de Contas – Remessa #${consignment.id}`} size="lg">
      <p className={`text-sm mb-4 ${sub}`}>
        Consignatário: <strong>{consignment.consignee?.name}</strong> · Informe a quantidade vendida e devolvida para cada item.
      </p>

      <div className={`rounded-lg border overflow-hidden ${cardBg}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={dark ? 'bg-slate-700/60' : 'bg-slate-100'}>
              <th className="px-3 py-2.5 text-left text-xs font-semibold">Produto</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold">Enviado</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold">Vendido</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold">Devolvido</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold">Pendente</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className={dark ? 'divide-y divide-slate-600' : 'divide-y divide-slate-200'}>
            {consignment.items.map((item, idx) => {
              const row = rows[idx];
              if (!row) return null;
              const pending = item.qty_sent - row.qty_sold - row.qty_returned;
              const over = (row.qty_sold + row.qty_returned) > item.qty_sent;
              const done = pending === 0 && !over;

              return (
                <tr key={item.id} className={over ? 'bg-red-500/5' : ''}>
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{item.product?.name ?? `Produto #${item.product_id}`}</p>
                    <p className={`text-xs ${sub}`}>
                      Preço: R$ {Number(item.agreed_unit_price).toFixed(2)}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold">{item.qty_sent}</td>
                  <td className="px-3 py-2.5 text-center">
                    <input type="number" min={0} max={item.qty_sent}
                      value={row.qty_sold}
                      onChange={e => updateRow(idx, 'qty_sold', parseInt(e.target.value) || 0)}
                      className={`w-16 text-center px-2 py-1.5 rounded border text-sm font-medium ${input} ${over ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <input type="number" min={0} max={item.qty_sent}
                      value={row.qty_returned}
                      onChange={e => updateRow(idx, 'qty_returned', parseInt(e.target.value) || 0)}
                      className={`w-16 text-center px-2 py-1.5 rounded border text-sm font-medium ${input} ${over ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    />
                  </td>
                  <td className={`px-3 py-2.5 text-center font-bold ${pending > 0 ? 'text-amber-500' : pending === 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {over ? 'Excede!' : pending}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {done ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium">
                        <Check className="w-3.5 h-3.5" /> OK
                      </span>
                    ) : over ? (
                      <span className="text-xs text-red-500 font-medium">Erro</span>
                    ) : (
                      <span className="text-xs text-amber-500 font-medium">Pendente</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.some((r, i) => (r.qty_sold + r.qty_returned) > consignment.items[i].qty_sent) && (
        <p className="text-red-500 text-xs mt-2">⚠ Há itens onde vendido + devolvido excede a quantidade enviada.</p>
      )}

      {rows.some(r => r.qty_returned > 0) && (
        <div className={`mt-3 p-3 rounded-lg border flex items-start gap-2 ${dark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
          <div className="text-blue-500 mt-0.5">ℹ</div>
          <div>
            <p className={`text-sm font-medium ${dark ? 'text-blue-400' : 'text-blue-800'}`}>Emissão Fiscal Automática</p>
            <p className={`text-xs ${dark ? 'text-blue-300/80' : 'text-blue-700/80'}`}>Ao salvar itens devolvidos, um rascunho de NF-e de Devolução será gerado automaticamente no Motor Financeiro com o CFOP aplicável.</p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={onClose}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dark ? 'text-slate-300 hover:bg-slate-700 border border-slate-600' : 'text-slate-600 hover:bg-slate-100 border border-slate-300'}`}
        >
          Cancelar
        </button>
        <button onClick={handleSave} disabled={saving || rows.some((r, i) => (r.qty_sold + r.qty_returned) > consignment.items[i].qty_sent)}
          className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Salvar Acerto
        </button>
      </div>
    </Modal>
  );
}
