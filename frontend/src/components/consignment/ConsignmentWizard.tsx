import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Loader2, ArrowLeft, ArrowRight, Check, Zap, Package, User, DollarSign, Calendar, ShieldCheck, AlertTriangle, Database, Activity, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import Modal from '../ui/Modal';
import type { Consignee, Product, WizardItem } from './types';
import { fmt } from './types';

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
    <Modal isOpen={isOpen} onClose={onClose} title="EXPEDIÇÃO DE REMESSA CONSIGNADA PLATINUM" size="lg">
      <div className="p-4 space-y-10 animate-in fade-in duration-700">
        {/* Progress Pipeline */}
        <div className="flex items-center justify-center gap-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[11px] font-black tracking-widest transition-all duration-500 border-2 shadow-platinum-glow-sm ${
                step >= s ? 'bg-primary text-white border-primary shadow-platinum-glow' : 'bg-surface-elevated/40 border-border-subtle/30 text-text-muted opacity-40'
              }`}>
                {step > s ? <Check className="w-7 h-7" /> : s.toString().padStart(2, '0')}
              </div>
              {s < 3 && <div className={`w-16 h-1 rounded-full transition-all duration-700 ${step > s ? 'bg-primary shadow-platinum-glow-sm' : 'bg-border-subtle/30'}`} />}
            </div>
          ))}
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.4em] flex items-center justify-center gap-4">
            <div className="w-8 h-px bg-primary/20" />
            {step === 1 && 'QUALIFICAÇÃO DO CONSIGNATÁRIO'}
            {step === 2 && 'SELEÇÃO DE ATIVOS E VALUATION'}
            {step === 3 && 'CONSOLIDAÇÃO E EMISSÃO NEURAL'}
            <div className="w-8 h-px bg-primary/20" />
          </h3>
          <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-60">Etapa {step} de 3 do Fluxo Operacional de Ativos</p>
        </div>

        {/* Step 1: Select Consignee */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input value={consigneeSearch} onChange={e => setConsigneeSearch(e.target.value)}
                placeholder="Pesquisar parceiro por nome, documento ou identificação digital..."
                className="w-full pl-16 pr-6 py-5 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[340px] overflow-y-auto scrollbar-platinum p-2">
              {filteredConsignees.map(c => (
                <button key={c.id} onClick={() => setSelectedConsignee(c)}
                  className={`text-left p-6 rounded-[1.5rem] border-2 transition-all duration-500 flex flex-col gap-4 group/card ${
                    selectedConsignee?.id === c.id 
                    ? 'bg-primary/5 border-primary text-text-primary shadow-platinum-glow-sm' 
                    : 'bg-surface-elevated/10 border-border-subtle/30 text-text-secondary hover:border-primary/20 hover:bg-surface-elevated/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${selectedConsignee?.id === c.id ? 'bg-primary text-white' : 'bg-surface-elevated border border-border-subtle text-text-muted'} transition-all`}>
                        <User size={16} />
                      </div>
                      <span className="font-black text-xs uppercase tracking-tight">{c.name}</span>
                    </div>
                    {selectedConsignee?.id === c.id && <Check className="text-primary w-5 h-5 animate-pulse" />}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-subtle/20">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">Digital_ID</span>
                      <span className="text-[10px] font-bold text-text-primary uppercase truncate">{c.document || '---'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">Credit_Limit</span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">{fmt(c.credit_limit)}</span>
                    </div>
                  </div>
                </button>
              ))}
              {filteredConsignees.length === 0 && (
                <div className="col-span-full py-16 text-center space-y-4 opacity-40">
                   <div className="w-20 h-20 bg-surface-elevated rounded-[2rem] flex items-center justify-center mx-auto border border-border-subtle shadow-inner-platinum">
                      <Search size={32} className="text-text-muted" />
                   </div>
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Nenhum parceiro localizado no ledger</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-border-subtle/30">
              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Previsão de Acerto (SLA)</label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full pl-16 pr-6 py-4.5 bg-background/50 border border-border-medium rounded-2xl text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
                  />
                </div>
              </div>
              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Diretrizes Adicionais Core</label>
                <div className="relative">
                  <Database className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
                  <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instruções de logística ou notas estratégicas..."
                    className="w-full pl-16 pr-6 py-4.5 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum"
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
                className="w-full pl-16 pr-6 py-5 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-platinum pb-4 p-2">
              {filteredProducts.filter(p => !items.find(i => i.product_id === p.id)).map(p => (
                <button key={p.id} onClick={() => addItem(p)}
                  className="flex-shrink-0 bg-surface-elevated/10 border border-border-subtle/30 p-6 rounded-[1.5rem] hover:border-primary/40 hover:bg-surface-elevated/20 transition-all duration-500 group/item w-64 text-left space-y-4 shadow-platinum-glow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform shadow-inner-platinum">
                       <Package size={18} />
                    </div>
                    <div className="p-2 bg-surface-elevated/40 rounded-lg text-primary opacity-0 group-hover/item:opacity-100 transition-opacity">
                       <Plus size={14} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-black text-[11px] text-text-primary uppercase tracking-tight truncate block">{p.name}</span>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">SKU: {p.sku || 'N/A'}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle/20">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Estoque: <span className="text-text-primary">{p.stock}</span></span>
                    <span className="text-[10px] font-black text-primary tracking-tighter">{fmt(p.base_price)}</span>
                  </div>
                </button>
              ))}
            </div>

            {items.length > 0 && (
              <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-elevated/40 border-b border-border-subtle">
                    <tr>
                      <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Ativo Core</th>
                      <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted text-center opacity-60">Qtde.</th>
                      <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted text-center opacity-60">Acordo Unit.</th>
                      <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted text-right opacity-60">Subtotal</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/20">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-elevated/20 transition-all duration-300">
                        <td className="px-8 py-6">
                          <div className="font-black text-[11px] text-text-primary uppercase tracking-tight">{item.productName}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center">
                            <input type="number" min={1} max={item.stock ?? 999} value={item.qty_sent}
                              onChange={e => updateItem(idx, 'qty_sent', Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-20 text-center bg-background/50 border border-border-medium rounded-xl py-2 text-xs font-black text-text-primary focus:border-primary/40 outline-none shadow-inner-platinum"
                            />
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center">
                            <input type="number" step="0.01" min={0} value={item.agreed_unit_price}
                              onChange={e => updateItem(idx, 'agreed_unit_price', parseFloat(e.target.value) || 0)}
                              className="w-28 text-center bg-background/50 border border-border-medium rounded-xl py-2 text-xs font-black text-text-primary focus:border-primary/40 outline-none font-mono shadow-inner-platinum"
                            />
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right font-black text-xs text-primary tracking-tighter">{fmt(item.qty_sent * item.agreed_unit_price)}</td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => removeItem(idx)} className="p-2.5 text-text-muted hover:text-red-500 transition-all hover:scale-110 shadow-inner-platinum rounded-lg"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-between items-center p-8 bg-surface-elevated/20 border border-border-subtle/30 rounded-3xl shadow-platinum-glow-sm">
              <div className="flex items-center gap-4 text-text-muted">
                 <Activity size={24} className="text-primary opacity-40" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em]">Resumo do Valuation de Carga</p>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] block opacity-60">TOTAL DA REMESSA</span>
                <span className="text-3xl font-black text-text-primary tracking-tighter transition-colors duration-500">{fmt(total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="platinum-card p-8 space-y-6 bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-border-subtle/30">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-primary" />
                    <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.4em]">PARCEIRO DESIGNADO</h4>
                  </div>
                  <ShieldCheck size={18} className="text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-text-primary uppercase tracking-tight">{selectedConsignee?.name}</p>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Digital_ID: {selectedConsignee?.document || 'SEM IDENTIFICAÇÃO'}</p>
                </div>
                <div className="pt-2">
                  <span className="px-4 py-2 text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-platinum-glow-sm">
                    COMISSÃO_SLA: {selectedConsignee?.commission_rate}%
                  </span>
                </div>
              </div>
              <div className="platinum-card p-8 space-y-6 bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-border-subtle/30">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-primary" />
                    <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.4em]">DIRETRIZES LOGÍSTICAS</h4>
                  </div>
                  <Zap size={18} className="text-amber-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-text-primary uppercase tracking-tight">Vencimento: {dueDate ? dueDate.split('-').reverse().join('/') : 'NÃO DEFINIDO'}</p>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Observações: {notes || 'NENHUMA DIRETRIZ REGISTRADA'}</p>
                </div>
              </div>
            </div>

            <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
              <div className="p-6 bg-surface-elevated/20 border-b border-border-subtle/30 flex justify-between items-center">
                <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.4em]">RESUMO DO MANIFESTO DE CARGA ({items.length} ITENS)</h4>
                <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-platinum-glow animate-pulse" />
              </div>
              <div className="p-8 space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 group/row">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-surface-elevated/40 rounded-xl border border-border-subtle flex items-center justify-center text-[10px] font-black text-text-muted group-hover/row:text-primary transition-colors shadow-inner-platinum">{idx + 1}</span>
                      <span className="text-[11px] font-black text-text-primary uppercase tracking-tight group-hover/row:translate-x-1 transition-all duration-300">{item.productName} <span className="text-primary mx-2">×</span> {item.qty_sent}</span>
                    </div>
                    <span className="text-xs font-black text-text-primary tracking-tighter">{fmt(item.qty_sent * item.agreed_unit_price)}</span>
                  </div>
                ))}
                <div className="border-t border-border-subtle/30 mt-6 pt-6 flex justify-between items-center">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">VALUATION TOTAL CONSOLIDADO</span>
                  <span className="text-2xl font-black text-text-primary tracking-tighter group-hover:text-primary transition-colors">{fmt(total)}</span>
                </div>
              </div>
            </div>
            <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] flex items-start gap-5 shadow-platinum-glow-sm">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Aviso de Conformidade Fiscal & Estoque</p>
                 <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] leading-relaxed opacity-80">
                  Ao confirmar esta operação, os ativos serão deduzidos instantaneamente do estoque central e movidos para a custódia externa do parceiro. Esta ação gera um manifesto de remessa operacional auditável.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-10 border-t border-border-subtle/30">
          <button onClick={() => step === 1 ? onClose() : setStep(step - 1)}
            className="flex items-center gap-3 px-10 py-5 text-[10px] font-black text-text-muted hover:text-text-primary uppercase tracking-[0.4em] transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />{step === 1 ? 'ABORTAR' : 'VOLTAR'}
          </button>
          
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !selectedConsignee : items.length === 0}
              className="flex items-center gap-4 px-12 py-5 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-text-primary font-black hover:bg-primary hover:text-white hover:border-primary transition-all uppercase text-[11px] tracking-[0.4em] disabled:opacity-20 group"
            >
              PRÓXIMA FASE<ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving}
              className="btn-primary py-5 px-16 shadow-platinum-glow uppercase text-[12px] tracking-[0.5em] flex items-center gap-5 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck size={24} className="shadow-platinum-glow-sm" />}
              CONFIRMAR EXPEDIÇÃO
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
