import { useState, useEffect } from 'react';
import { Loader2, Check, AlertTriangle, ShieldCheck, Zap, Info, Package, DollarSign, Database, Activity, ChevronRight } from 'lucide-react';
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
 copy[idx] = {...copy[idx], [field]: Math.max(0, value) };
 setRows(copy);
 };

 if (!consignment) return null;

 const hasOver = rows.some((r, i) => (r.qty_sold + r.qty_returned) > consignment.items[i].qty_sent);

 return (
 <Modal isOpen={isOpen} onClose={onClose} title={`PRESTAÇÃO DE CONTAS – REMESSA NEURAL #${consignment.id}`} size="lg">
 <div className="p-4 space-y-10 animate-in fade-in duration-700">
 <header className="flex flex-col gap-6 bg-bg-tertiary/10 p-8 rounded-xl border border-border/30 ">
 <div className="flex items-center gap-4">
 <div className="w-1.5 h-6 bg-primary rounded-full " />
 <span className="text-xs font-semibold text-text-muted uppercase opacity-60">Consignatário Estratégico em Campo</span>
 </div>
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
 <h3 className="text-2xl font-semibold text-text-primary uppercase tracking-tight flex items-center gap-4">
 <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20 ">
 <ShieldCheck size={24} />
 </div>
 {consignment.consignee?.name}
 </h3>
 <div className="text-right p-4 bg-background/50 border border-border rounded-2xl min-w-[200px]">
 <span className="text-xs font-semibold text-text-muted uppercase tracking-widest block opacity-60 mb-1">Valuation em Custódia</span>
 <span className="text-xl font-semibold text-primary tracking-tight">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(consignment.total_value))}</span>
 </div>
 </div>
 </header>

 <div className="card overflow-hidden bg-bg-tertiary/10 backdrop-blur-md border-border/30 ">
 <table className="w-full text-left text-sm">
 <thead className="bg-bg-tertiary/40 border-b border-border/30">
 <tr>
 <th className="px-6 py-5 font-semibold uppercase text-xs tracking-widest text-text-muted opacity-60">Ativo Core</th>
 <th className="px-6 py-5 font-semibold uppercase text-xs tracking-widest text-text-muted text-center opacity-60">Enviado</th>
 <th className="px-6 py-5 font-semibold uppercase text-xs tracking-widest text-text-muted text-center opacity-60">Vendido</th>
 <th className="px-6 py-5 font-semibold uppercase text-xs tracking-widest text-text-muted text-center opacity-60">Devolvido</th>
 <th className="px-6 py-5 font-semibold uppercase text-xs tracking-widest text-text-muted text-center opacity-60">Balanço</th>
 <th className="px-6 py-5 font-semibold uppercase text-xs text-text-muted text-right opacity-60">Status Cycle</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/20">
 {consignment.items.map((item, idx) => {
 const row = rows[idx];
 if (!row) return null;
 const pending = item.qty_sent - row.qty_sold - row.qty_returned;
 const over = (row.qty_sold + row.qty_returned) > item.qty_sent;
 const done = pending === 0 && !over;

 return (
 <tr key={item.id} className={`hover:bg-bg-tertiary/20 transition-all duration-300 border-b border-border/10 ${over ? 'bg-red-500/5' : ''}`}>
 <td className="px-6 py-8">
 <div className="flex items-center gap-4 group/item">
 <div className="p-2.5 rounded-xl bg-bg-tertiary/40 border border-border text-text-muted group-hover/item:text-primary transition-colors ">
 <Package size={14} />
 </div>
 <div className="font-semibold text-sm text-text-primary uppercase tracking-tight truncate max-w-[180px] group-hover/item:translate-x-1 transition-transform">{item.product?.name ?? `Item_#${item.product_id}`}</div>
 </div>
 </td>
 <td className="px-6 py-8 text-center text-xs font-semibold text-text-secondary opacity-60">{item.qty_sent.toString().padStart(2, '0')}</td>
 <td className="px-6 py-8">
 <div className="flex justify-center">
 <input type="number" min={0} max={item.qty_sent}
 value={row.qty_sold}
 onChange={e => updateRow(idx, 'qty_sold', parseInt(e.target.value) || 0)}
 className={`w-20 text-center bg-background/50 border rounded-xl py-2.5 text-xs font-semibold text-text-primary focus:border-primary/40 outline-none transition-all ${over ? 'border-red-500 ring-2 ring-red-500/10' : 'border-border'}`}
 />
 </div>
 </td>
 <td className="px-6 py-8">
 <div className="flex justify-center">
 <input type="number" min={0} max={item.qty_sent}
 value={row.qty_returned}
 onChange={e => updateRow(idx, 'qty_returned', parseInt(e.target.value) || 0)}
 className={`w-20 text-center bg-background/50 border rounded-xl py-2.5 text-xs font-semibold text-text-primary focus:border-primary/40 outline-none transition-all ${over ? 'border-red-500 ring-2 ring-red-500/10' : 'border-border'}`}
 />
 </div>
 </td>
 <td className={`px-6 py-8 text-center font-semibold text-xs transition-colors duration-500 ${pending > 0 ? 'text-amber-500' : pending === 0 ? 'text-emerald-500' : 'text-red-500'}`}>
 {over ? (
 <span className="animate-pulse flex items-center justify-center gap-2">
 <AlertTriangle size={12} /> EXCESSO
 </span>
 ) : pending.toString().padStart(2, '0')}
 </td>
 <td className="px-6 py-8 text-right">
 <div className="flex justify-end">
 {done ? (
 <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold uppercase tracking-wider border border-emerald-500/20 ">
 <Check size={12} /> CONCLUÍDO
 </span>
 ) : over ? (
 <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold uppercase tracking-wider border border-red-500/20 animate-pulse ">
 <AlertTriangle size={12} /> ERRO_LOG
 </span>
 ) : (
 <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-semibold uppercase tracking-wider border border-amber-500/20 ">
 <Zap size={12} className="animate-pulse" /> PENDENTE
 </span>
 )}
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {hasOver && (
 <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-6 animate-in shake duration-500">
 <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
 <AlertTriangle size={24} className="text-red-500" />
 </div>
 <div className="space-y-1">
 <p className="text-xs font-semibold text-red-500 uppercase ">Inconsistência Crítica de Ledger</p>
 <p className="text-xs font-bold text-text-muted uppercase tracking-wider opacity-80 leading-relaxed">
 A somatória de ativos liquidados e devolvidos excede o manifesto original de remessa. Verifique as quantidades antes da consolidação.
 </p>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="p-8 bg-bg-tertiary/20 border border-border/30 rounded-xl flex items-start gap-6 group">
 <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20 group-hover:scale-110 transition-transform">
 <Info size={20} />
 </div>
 <div className="space-y-2">
 <h4 className="text-xs font-semibold text-text-primary uppercase ">Inteligência Fiscal RPA</h4>
 <p className="text-xs font-semibold text-text-muted uppercase tracking-wider leading-relaxed opacity-60">
 A devolução de ativos gera automaticamente um draft de NF-e (CFOP_6209) no motor fiscal para fins de compliance auditável.
 </p>
 </div>
 </div>
 <div className="p-8 bg-bg-tertiary/20 border border-border/30 rounded-xl flex items-start gap-6 group">
 <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
 <Database size={20} />
 </div>
 <div className="space-y-2">
 <h4 className="text-xs font-semibold text-text-primary uppercase ">Geração de Valor Core</h4>
 <p className="text-xs font-semibold text-text-muted uppercase tracking-wider leading-relaxed opacity-60">
 Unidades liquidadas serão convertidas em títulos de faturamento na tesouraria global contra o consignatário designado.
 </p>
 </div>
 </div>
 </div>

 <div className="flex justify-end gap-6 pt-10 border-t border-border/30">
 <button onClick={onClose}
 className="px-10 py-5 text-xs font-semibold text-text-muted hover:text-text-primary uppercase transition-all"
 >
 ABORTAR ACERTO
 </button>
 <button onClick={handleSave} disabled={saving || hasOver}
 className="btn btn-primary py-5 px-16 flex items-center gap-5 uppercase text-sm disabled:opacity-20"
 >
 {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck size={24} className="" />}
 CONSOLIDAR ACERTO NEURAL
 </button>
 </div>
 </div>
 </Modal>
 );
}
