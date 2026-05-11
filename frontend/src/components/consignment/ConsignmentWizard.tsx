import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Loader2, ArrowLeft, ArrowRight, Check, Zap, Package, User, DollarSign, Calendar, ShieldCheck, AlertTriangle, Database, Activity, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import Modal from '../ui/Modal';
import { DatePicker } from '../ui/DatePicker';
import type { Consignee, Product, WizardItem } from './types';
import { fmt } from './types';
import { format } from 'date-fns';

interface Props {
 isOpen: boolean;
 onClose: () => void;
 onSuccess: () => void;
}

export default function ConsignmentWizard({ isOpen, onClose, onSuccess }: Props) {
 const [step, setStep] = useState(1);
 const [saving, setSaving] = useState(false);

 // Step 1
 const [consignees, setConsignees] = useState<Consignee[]>([]);
 const [consigneeSearch, setConsigneeSearch] = useState('');
 const [selectedConsignee, setSelectedConsignee] = useState<Consignee | null>(null);
 const [dueDate, setDueDate] = useState('');
 const [notes, setNotes] = useState('');

 // Step 2
 const [products, setProducts] = useState<Product[]>([]);
 const [productSearch, setProductSearch] = useState('');
 const [items, setItems] = useState<WizardItem[]>([]);

 useEffect(() => {
 if (!isOpen) return;
 setStep(1); setSelectedConsignee(null); setItems([]); setDueDate(''); setNotes(''); setConsigneeSearch('');
 api.get('/api/consignees', { params: { active_only: true } }).then(r => setConsignees(r.data.data ?? [])).catch(() => {});
 api.get('/api/consignments/products').then(r => setProducts(r.data.data ?? [])).catch(() => {});
 }, [isOpen]);

 const filteredConsignees = consignees.filter(c =>
 c.name.toLowerCase().includes(consigneeSearch.toLowerCase()) ||
 (c.document ?? '').includes(consigneeSearch)
 );

 const filteredProducts = products.filter(p =>
 p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
 (p.sku ?? '').toLowerCase().includes(productSearch.toLowerCase())
 );

 const addItem = (p: Product) => {
 if (items.find(i => i.product_id === p.id)) return;
 setItems([...items, { product_id: p.id, qty_sent: 1, agreed_unit_price: Number(p.base_price), productName: p.name, stock: p.stock }]);
 };

 const updateItem = (idx: number, field: string, value: number) => {
 const copy = [...items];
 (copy[idx] as any)[field] = value;
 setItems(copy);
 };

 const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

 const total = items.reduce((s, i) => s + i.qty_sent * i.agreed_unit_price, 0);

 const handleSubmit = async () => {
 if (!selectedConsignee || items.length === 0) return;
 setSaving(true);
 try {
 await api.post('/api/consignments', {
 consignee_id: selectedConsignee.id,
 due_date: dueDate || null,
 notes: notes || null,
 status: 'active',
 items: items.map(i => ({ product_id: i.product_id, qty_sent: i.qty_sent, agreed_unit_price: i.agreed_unit_price })),
 });
 toast.success('Remessa criada e ativos reservados!');
 onSuccess();
 onClose();
 } catch (e: any) {
 const msg = e?.response?.data?.message || 'Erro ao criar remessa operacional';
 toast.error(msg);
 } finally {
 setSaving(false);
 }
 };

 return (
 <Modal isOpen={isOpen} onClose={onClose} title="EXPEDIÇÃO DE REMESSA CONSIGNADA " size="lg">
 <div className="p-4 space-y-10 animate-in fade-in duration-700">
 {/* Progress Pipeline */}
 <div className="flex items-center justify-center gap-6">
 {[1, 2, 3].map(s => (
 <div key={s} className="flex items-center gap-6">
 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-semibold tracking-widest transition-all duration-500 border-2 ${
 step >= s ? 'bg-primary text-white border-primary ' : 'bg-bg-tertiary/40 border-border/30 text-text-muted opacity-40'
 }`}>
 {step > s ? <Check className="w-7 h-7" /> : s.toString().padStart(2, '0')}
 </div>
 {s < 3 && <div className={`w-16 h-1 rounded-full transition-all duration-700 ${step > s ? 'bg-primary ' : 'bg-border-subtle/30'}`} />}
 </div>
 ))}
 </div>

 <div className="text-center space-y-2">
 <h3 className="text-sm font-semibold text-text-primary uppercase flex items-center justify-center gap-4">
 <div className="w-8 h-px bg-primary/20" />
 {step === 1 && 'QUALIFICAÇÃO DO CONSIGNATÁRIO'}
 {step === 2 && 'SELEÇÃO DE ATIVOS E VALUATION'}
 {step === 3 && 'CONSOLIDAÇÃO E EMISSÃO NEURAL'}
 <div className="w-8 h-px bg-primary/20" />
 </h3>
 <p className="text-xs text-text-muted font-semibold uppercase tracking-widest opacity-60">Etapa {step} de 3 do Fluxo Operacional de Ativos</p>
 </div>

 {/* Step 1: Select Consignee */}
 {step === 1 && (
 <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
 <div className="relative group">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
 <input value={consigneeSearch} onChange={e => setConsigneeSearch(e.target.value)}
 placeholder="Pesquisar parceiro por nome, documento ou identificação digital..."
 className="w-full pl-16 pr-6 py-5 bg-background/50 border border-border rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 "
 />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[340px] overflow-y-auto p-2">
 {filteredConsignees.map(c => (
 <button key={c.id} onClick={() => setSelectedConsignee(c)}
 className={`text-left p-6 rounded-xl border-2 transition-all duration-500 flex flex-col gap-4 group/card ${
 selectedConsignee?.id === c.id 
 ? 'bg-primary/5 border-primary text-text-primary ' 
 : 'bg-bg-tertiary/10 border-border/30 text-text-secondary hover:border-primary/20 hover:bg-bg-tertiary/20'
 }`}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className={`p-2.5 rounded-xl ${selectedConsignee?.id === c.id ? 'bg-primary text-white' : 'bg-bg-tertiary border border-border text-text-muted'} transition-all`}>
 <User size={16} />
 </div>
 <span className="font-semibold text-xs uppercase tracking-tight">{c.name}</span>
 </div>
 {selectedConsignee?.id === c.id && <Check className="text-primary w-5 h-5 animate-pulse" />}
 </div>
 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/20">
 <div className="flex flex-col gap-1">
 <span className="text-xs font-semibold text-text-muted uppercase tracking-widest opacity-60">Digital_ID</span>
 <span className="text-xs font-bold text-text-primary uppercase truncate">{c.document || '---'}</span>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-xs font-semibold text-text-muted uppercase tracking-widest opacity-60">Credit_Limit</span>
 <span className="text-xs font-semibold text-emerald-500 uppercase tracking-tight">{fmt(c.credit_limit)}</span>
 </div>
 </div>
 </button>
 ))}
 {filteredConsignees.length === 0 && (
 <div className="col-span-full py-16 text-center space-y-4 opacity-40">
 <div className="w-20 h-20 bg-bg-tertiary rounded-xl flex items-center justify-center mx-auto border border-border ">
 <Search size={32} className="text-text-muted" />
 </div>
 <p className="text-xs font-semibold text-text-muted uppercase ">Nenhum parceiro localizado no ledger</p>
 </div>
 )}
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-border/30">
 <div className="space-y-4 group">
 <label className="text-xs font-semibold text-text-muted uppercase px-2 group-focus-within:text-primary transition-colors">Previsão de Acerto (SLA)</label>
 <DatePicker
 selected={dueDate ? new Date(`${dueDate}T12:00:00`) : null}
 onChange={date => setDueDate(date ? format(date, "yyyy-MM-dd") : '')}
 />
 </div>
 <div className="space-y-4 group">
 <label className="text-xs font-semibold text-text-muted uppercase px-2 group-focus-within:text-primary transition-colors">Diretrizes Adicionais Core</label>
 <div className="relative">
 <Database className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
 <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instruções de logística ou notas estratégicas..."
 className="w-full pl-16 pr-6 py-4 bg-background/50 border border-border rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all "
 />
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Step 2: Add Items */}
 {step === 2 && (
 <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
 <div className="relative group">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
 <input value={productSearch} onChange={e => setProductSearch(e.target.value)}
 placeholder="Interrogar ativos na matriz de estoque central..."
 className="w-full pl-16 pr-6 py-5 bg-background/50 border border-border rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 "
 />
 </div>
 <div className="flex gap-4 overflow-x-auto pb-4 p-2">
 {filteredProducts.filter(p => !items.find(i => i.product_id === p.id)).map(p => (
 <button key={p.id} onClick={() => addItem(p)}
 className="flex-shrink-0 bg-bg-tertiary/10 border border-border/30 p-6 rounded-xl hover:border-primary/40 hover:bg-bg-tertiary/20 transition-all duration-500 group/item w-64 text-left space-y-4 "
 >
 <div className="flex items-center justify-between">
 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform ">
 <Package size={18} />
 </div>
 <div className="p-2 bg-bg-tertiary/40 rounded-lg text-primary opacity-0 group-hover/item:opacity-100 transition-opacity">
 <Plus size={14} />
 </div>
 </div>
 <div className="space-y-1">
 <span className="font-semibold text-sm text-text-primary uppercase tracking-tight truncate block">{p.name}</span>
 <p className="text-xs font-semibold text-text-muted uppercase tracking-widest opacity-60">SKU: {p.sku || 'N/A'}</p>
 </div>
 <div className="flex items-center justify-between pt-3 border-t border-border/20">
 <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">Estoque: <span className="text-text-primary">{p.stock}</span></span>
 <span className="text-xs font-semibold text-primary tracking-tight">{fmt(p.base_price)}</span>
 </div>
 </button>
 ))}
 </div>

 {items.length > 0 && (
 <div className="card overflow-hidden bg-bg-tertiary/10 backdrop-blur-md border-border/30 ">
 <table className="w-full text-left text-sm">
 <thead className="bg-bg-tertiary/40 border-b border-border">
 <tr>
 <th className="px-8 py-5 font-semibold uppercase text-xs tracking-widest text-text-muted opacity-60">Ativo Core</th>
 <th className="px-8 py-5 font-semibold uppercase text-xs tracking-widest text-text-muted text-center opacity-60">Qtde.</th>
 <th className="px-8 py-5 font-semibold uppercase text-xs tracking-widest text-text-muted text-center opacity-60">Acordo Unit.</th>
 <th className="px-8 py-5 font-semibold uppercase text-xs tracking-widest text-text-muted text-right opacity-60">Subtotal</th>
 <th className="px-8 py-5"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/20">
 {items.map((item, idx) => (
 <tr key={idx} className="hover:bg-bg-tertiary/20 transition-all duration-300">
 <td className="px-8 py-6">
 <div className="font-semibold text-sm text-text-primary uppercase tracking-tight">{item.productName}</div>
 </td>
 <td className="px-8 py-6">
 <div className="flex justify-center">
 <input type="number" min={1} max={item.stock ?? 999} value={item.qty_sent}
 onChange={e => updateItem(idx, 'qty_sent', Math.max(1, parseInt(e.target.value) || 1))}
 className="w-20 text-center bg-background/50 border border-border rounded-xl py-2 text-xs font-semibold text-text-primary focus:border-primary/40 outline-none "
 />
 </div>
 </td>
 <td className="px-8 py-6">
 <div className="flex justify-center">
 <input type="number" step="0.01" min={0} value={item.agreed_unit_price}
 onChange={e => updateItem(idx, 'agreed_unit_price', parseFloat(e.target.value) || 0)}
 className="w-28 text-center bg-background/50 border border-border rounded-xl py-2 text-xs font-semibold text-text-primary focus:border-primary/40 outline-none font-mono "
 />
 </div>
 </td>
 <td className="px-8 py-6 text-right font-semibold text-xs text-primary tracking-tight">{fmt(item.qty_sent * item.agreed_unit_price)}</td>
 <td className="px-8 py-6 text-right">
 <button onClick={() => removeItem(idx)} className="p-2.5 text-text-muted hover:text-red-500 transition-all hover:scale-110 rounded-lg"><Trash2 size={16} /></button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 <div className="flex justify-between items-center p-8 bg-bg-tertiary/20 border border-border/30 rounded-3xl ">
 <div className="flex items-center gap-4 text-text-muted">
 <Activity size={24} className="text-primary opacity-40" />
 <p className="text-xs font-semibold uppercase tracking-widest">Resumo do Valuation de Carga</p>
 </div>
 <div className="text-right space-y-1">
 <span className="text-xs font-semibold text-text-muted uppercase tracking-widest block opacity-60">TOTAL DA REMESSA</span>
 <span className="text-3xl font-semibold text-text-primary tracking-tight transition-colors duration-500">{fmt(total)}</span>
 </div>
 </div>
 </div>
 )}

 {/* Step 3: Review */}
 {step === 3 && (
 <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="card p-8 space-y-6 bg-bg-tertiary/10 backdrop-blur-md border-border/30 ">
 <div className="flex items-center justify-between pb-4 border-b border-border/30">
 <div className="flex items-center gap-3">
 <User size={18} className="text-primary" />
 <h4 className="text-xs font-semibold text-text-primary uppercase ">PARCEIRO DESIGNADO</h4>
 </div>
 <ShieldCheck size={18} className="text-emerald-500" />
 </div>
 <div className="space-y-2">
 <p className="text-sm font-semibold text-text-primary uppercase tracking-tight">{selectedConsignee?.name}</p>
 <p className="text-xs font-semibold text-text-muted uppercase tracking-widest opacity-60">Digital_ID: {selectedConsignee?.document || 'SEM IDENTIFICAÇÃO'}</p>
 </div>
 <div className="pt-2">
 <span className="px-4 py-2 text-xs font-semibold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 rounded-xl border border-emerald-500/20 ">
 COMISSÃO_SLA: {selectedConsignee?.commission_rate}%
 </span>
 </div>
 </div>
 <div className="card p-8 space-y-6 bg-bg-tertiary/10 backdrop-blur-md border-border/30 ">
 <div className="flex items-center justify-between pb-4 border-b border-border/30">
 <div className="flex items-center gap-3">
 <Calendar size={18} className="text-primary" />
 <h4 className="text-xs font-semibold text-text-primary uppercase ">DIRETRIZES LOGÍSTICAS</h4>
 </div>
 <Zap size={18} className="text-amber-500" />
 </div>
 <div className="space-y-2">
 <p className="text-sm font-semibold text-text-primary uppercase tracking-tight">Vencimento: {dueDate ? dueDate.split('-').reverse().join('/') : 'NÃO DEFINIDO'}</p>
 <p className="text-xs font-semibold text-text-muted uppercase tracking-widest opacity-60">Observações: {notes || 'NENHUMA DIRETRIZ REGISTRADA'}</p>
 </div>
 </div>
 </div>

 <div className="card overflow-hidden bg-bg-tertiary/10 backdrop-blur-md border-border/30 ">
 <div className="p-6 bg-bg-tertiary/20 border-b border-border/30 flex justify-between items-center">
 <h4 className="text-xs font-semibold text-text-primary uppercase ">RESUMO DO MANIFESTO DE CARGA ({items.length} ITENS)</h4>
 <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
 </div>
 <div className="p-8 space-y-4">
 {items.map((item, idx) => (
 <div key={idx} className="flex justify-between items-center py-2 group/row">
 <div className="flex items-center gap-4">
 <span className="w-8 h-8 bg-bg-tertiary/40 rounded-xl border border-border flex items-center justify-center text-xs font-semibold text-text-muted group-hover/row:text-primary transition-colors ">{idx + 1}</span>
 <span className="text-sm font-semibold text-text-primary uppercase tracking-tight group-hover/row:translate-x-1 transition-all duration-300">{item.productName} <span className="text-primary mx-2">×</span> {item.qty_sent}</span>
 </div>
 <span className="text-xs font-semibold text-text-primary tracking-tight">{fmt(item.qty_sent * item.agreed_unit_price)}</span>
 </div>
 ))}
 <div className="border-t border-border/30 mt-6 pt-6 flex justify-between items-center">
 <span className="text-xs font-semibold text-text-muted uppercase opacity-60">VALUATION TOTAL CONSOLIDADO</span>
 <span className="text-2xl font-semibold text-text-primary tracking-tight group-hover:text-primary transition-colors">{fmt(total)}</span>
 </div>
 </div>
 </div>
 <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-5 ">
 <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
 <AlertTriangle size={24} className="text-amber-500" />
 </div>
 <div className="space-y-1">
 <p className="text-xs font-semibold text-amber-500 uppercase ">Aviso de Conformidade Fiscal & Estoque</p>
 <p className="text-xs font-bold text-text-muted uppercase tracking-wider leading-relaxed opacity-80">
 Ao confirmar esta operação, os ativos serão deduzidos instantaneamente do estoque central e movidos para a custódia externa do parceiro. Esta ação gera um manifesto de remessa operacional auditável.
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Navigation */}
 <div className="flex justify-between items-center pt-10 border-t border-border/30">
 <button onClick={() => step === 1 ? onClose() : setStep(step - 1)}
 className="flex items-center gap-3 px-10 py-5 text-xs font-semibold text-text-muted hover:text-text-primary uppercase transition-all group"
 >
 <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />{step === 1 ? 'ABORTAR' : 'VOLTAR'}
 </button>
 
 {step < 3 ? (
 <button onClick={() => setStep(step + 1)}
 disabled={step === 1 ? !selectedConsignee : items.length === 0}
 className="flex items-center gap-4 px-12 py-5 bg-bg-tertiary/40 border border-border rounded-2xl text-text-primary font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all uppercase text-sm disabled:opacity-20 group"
 >
 PRÓXIMA FASE<ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
 </button>
 ) : (
 <button onClick={handleSubmit} disabled={saving}
 className="btn btn-primary py-5 px-16 uppercase text-[12px] flex items-center gap-5 disabled:opacity-60"
 >
 {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck size={24} className="" />}
 CONFIRMAR EXPEDIÇÃO
 </button>
 )}
 </div>
 </div>
 </Modal>
 );
}
