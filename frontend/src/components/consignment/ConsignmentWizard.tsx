import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Loader2, ArrowLeft, ArrowRight, Check, Zap, Package, User, DollarSign, Calendar, ShieldCheck } from 'lucide-react';
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
    <Modal isOpen={isOpen} onClose={onClose} title="EXPEDIÇÃO DE REMESSA CONSIGNADA" size="lg">
      <div className="p-2 space-y-8 animate-in fade-in duration-500">
        {/* Progress Pipeline */}
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all border ${
                step >= s ? 'bg-primary text-background border-primary shadow-platinum-glow' : 'bg-white/[0.02] border-white/5 text-text-muted'
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-px ${step > s ? 'bg-primary' : 'bg-white/5'}`} />}
            </div>
          ))}
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">
            {step === 1 && 'QUALIFICAÇÃO DO CONSIGNATÁRIO'}
            {step === 2 && 'SELEÇÃO DE ATIVOS E VALUATION'}
            {step === 3 && 'CONSOLIDAÇÃO E EMISSÃO'}
          </h3>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest italic">Fase {step} de 3 da operação de remessa</p>
        </div>

        {/* Step 1: Select Consignee */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input value={consigneeSearch} onChange={e => setConsigneeSearch(e.target.value)}
                placeholder="Pesquisar por nome, documento ou identificador..."
                className="w-full pl-11 pr-4 py-3.5 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all placeholder:text-text-muted"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto custom-scrollbar p-1">
              {filteredConsignees.map(c => (
                <button key={c.id} onClick={() => setSelectedConsignee(c)}
                  className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                    selectedConsignee?.id === c.id 
                    ? 'bg-primary/10 border-primary text-white shadow-[0_0_15px_-5px_rgba(206,156,98,0.3)]' 
                    : 'bg-white/[0.02] border-white/5 text-text-secondary hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User size={12} className={selectedConsignee?.id === c.id ? 'text-primary' : 'text-text-muted'} />
                    <span className="font-black text-[11px] uppercase tracking-wider">{c.name}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Documento: {c.document || 'N/A'}</span>
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Limite: <span className="text-emerald-400">{fmt(c.credit_limit)}</span></span>
                  </div>
                </button>
              ))}
              {filteredConsignees.length === 0 && (
                <div className="col-span-full py-8 text-center text-[10px] font-black text-text-muted uppercase tracking-widest bg-white/[0.01] rounded-xl border border-dashed border-white/5">
                  Nenhum parceiro localizado
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Previsão de Acerto</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all appearance-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Diretrizes Adicionais</label>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instruções de entrega ou notas..."
                  className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Add Items */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input value={productSearch} onChange={e => setProductSearch(e.target.value)}
                placeholder="Localizar ativos na matriz de estoque..."
                className="w-full pl-11 pr-4 py-3.5 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all placeholder:text-text-muted"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 p-1">
              {filteredProducts.filter(p => !items.find(i => i.product_id === p.id)).map(p => (
                <button key={p.id} onClick={() => addItem(p)}
                  className="flex-shrink-0 bg-white/[0.02] border border-white/5 p-4 rounded-xl hover:border-primary/40 hover:bg-white/[0.04] transition-all group w-56 text-left space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Package size={12} className="text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-black text-[10px] text-white uppercase tracking-wider truncate">{p.name}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Estoque: {p.stock}</span>
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{fmt(p.base_price)}</span>
                  </div>
                </button>
              ))}
            </div>

            {items.length > 0 && (
              <div className="platinum-card overflow-hidden border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-4 py-4 font-black uppercase text-[10px] tracking-widest text-text-muted">Item</th>
                      <th className="px-4 py-4 font-black uppercase text-[10px] tracking-widest text-text-muted text-center">Quant.</th>
                      <th className="px-4 py-4 font-black uppercase text-[10px] tracking-widest text-text-muted text-center">Acordo Unit.</th>
                      <th className="px-4 py-4 font-black uppercase text-[10px] tracking-widest text-text-muted text-right">Subtotal</th>
                      <th className="px-4 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-black text-[10px] text-white uppercase tracking-wider">{item.productName}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <input type="number" min={1} max={item.stock ?? 999} value={item.qty_sent}
                              onChange={e => updateItem(idx, 'qty_sent', Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-16 text-center bg-background border border-white/10 rounded-lg py-1.5 text-xs text-white focus:border-primary/40 outline-none"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <input type="number" step="0.01" min={0} value={item.agreed_unit_price}
                              onChange={e => updateItem(idx, 'agreed_unit_price', parseFloat(e.target.value) || 0)}
                              className="w-24 text-center bg-background border border-white/10 rounded-lg py-1.5 text-xs text-white focus:border-primary/40 outline-none font-mono"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-black text-xs text-primary">{fmt(item.qty_sent * item.agreed_unit_price)}</td>
                        <td className="px-4 py-4 text-right">
                          <button onClick={() => removeItem(idx)} className="p-2 text-text-muted hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="text-right">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block mb-1">TOTAL DA REMESSA</span>
                <span className="text-2xl font-black text-white tracking-tighter">{fmt(total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="platinum-card p-6 space-y-4 border-white/10">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <User size={14} className="text-primary" />
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest">PARCEIRO DESIGNADO</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-white uppercase">{selectedConsignee?.name}</p>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{selectedConsignee?.document || 'SEM DOCUMENTO'}</p>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    COMISSÃO: {selectedConsignee?.commission_rate}%
                  </span>
                </div>
              </div>
              <div className="platinum-card p-6 space-y-4 border-white/10">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Calendar size={14} className="text-primary" />
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest">DADOS LOGÍSTICOS</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-white uppercase">Vencimento: {dueDate ? dueDate.split('-').reverse().join('/') : 'NÃO DEFINIDO'}</p>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Observação: {notes || 'NENHUMA NOTA ADICIONADA'}</p>
                </div>
              </div>
            </div>

            <div className="platinum-card overflow-hidden border-white/10">
              <div className="p-4 bg-white/[0.01] border-b border-white/5">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">RESUMO DA CARGA ({items.length} ITENS)</h4>
              </div>
              <div className="p-4 space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-white/[0.03] rounded border border-white/5 flex items-center justify-center text-[9px] font-black text-text-muted">{idx + 1}</span>
                      <span className="text-[10px] font-bold text-white uppercase">{item.productName} × {item.qty_sent}</span>
                    </div>
                    <span className="text-[10px] font-black text-primary">{fmt(item.qty_sent * item.agreed_unit_price)}</span>
                  </div>
                ))}
                <div className="border-t border-white/5 mt-4 pt-4 flex justify-between items-center">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">VALUATION TOTAL</span>
                  <span className="text-xl font-black text-white tracking-tighter">{fmt(total)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-amber-500/80 uppercase tracking-widest leading-relaxed">
                Ao confirmar, os ativos serão deduzidos do estoque central e movidos para o registro de posse do parceiro. Esta operação gera uma nota de remessa operacional.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-white/5">
          <button onClick={() => step === 1 ? onClose() : setStep(step - 1)}
            className="flex items-center gap-2 px-6 py-3 text-[10px] font-black text-text-muted hover:text-white uppercase tracking-widest transition-all"
          >
            <ArrowLeft className="w-4 h-4" />{step === 1 ? 'Descartar' : 'Voltar'}
          </button>
          
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !selectedConsignee : items.length === 0}
              className="flex items-center gap-3 px-8 py-3 bg-white/[0.02] border border-white/10 text-white font-black rounded-xl hover:bg-primary hover:text-background hover:border-primary transition-all uppercase text-[10px] tracking-widest disabled:opacity-20"
            >
              Próxima Fase<ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-3 px-10 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-[10px] tracking-widest disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck size={16} />}
              Confirmar Expedição
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
