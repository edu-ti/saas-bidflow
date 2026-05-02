import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import Modal from '../ui/Modal';
import { useTheme } from '../../context/ThemeContext';
import type { Consignee, Product, WizardItem } from './types';
import { fmt } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConsignmentWizard({ isOpen, onClose, onSuccess }: Props) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
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
      toast.success('Remessa criada e estoque reservado!');
      onSuccess();
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Erro ao criar remessa';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const input = dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900';
  const label = dark ? 'text-slate-300' : 'text-slate-700';
  const sub = dark ? 'text-slate-400' : 'text-slate-500';
  const cardBg = dark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Remessa de Consignação" size="lg">
      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-blue-600 text-white' : dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-blue-600' : dark ? 'bg-slate-700' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>
      <p className={`text-center text-sm mb-6 ${sub}`}>
        {step === 1 && 'Selecione o consignatário'}
        {step === 2 && 'Adicione os produtos da remessa'}
        {step === 3 && 'Revise e confirme a emissão'}
      </p>

      {/* Step 1: Select Consignee */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`} />
            <input value={consigneeSearch} onChange={e => setConsigneeSearch(e.target.value)}
              placeholder="Buscar consignatário por nome ou CPF/CNPJ..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
            />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredConsignees.map(c => (
              <button key={c.id} onClick={() => setSelectedConsignee(c)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${selectedConsignee?.id === c.id ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500' : cardBg + ' hover:border-blue-400'}`}
              >
                <p className="font-medium text-sm">{c.name}</p>
                <p className={`text-xs mt-0.5 ${sub}`}>{c.document || 'Sem documento'} · Limite: {fmt(c.credit_limit)} · Comissão: {c.commission_rate}%</p>
              </button>
            ))}
            {filteredConsignees.length === 0 && <p className={`text-center py-4 text-sm ${sub}`}>Nenhum consignatário encontrado</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${label}`}>Vencimento</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${label}`}>Observações</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional"
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Add Items */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`} />
            <input value={productSearch} onChange={e => setProductSearch(e.target.value)}
              placeholder="Buscar produto..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
            />
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1">
            {filteredProducts.filter(p => !items.find(i => i.product_id === p.id)).map(p => (
              <button key={p.id} onClick={() => addItem(p)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-sm transition-all ${cardBg} hover:border-blue-400`}
              >
                <span className="font-medium">{p.name} {p.sku ? `(${p.sku})` : ''}</span>
                <span className={`text-xs ${sub}`}>Estoque: {p.stock} · {fmt(p.base_price)}</span>
              </button>
            ))}
          </div>
          {items.length > 0 && (
            <div className={`rounded-lg border overflow-hidden ${cardBg}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={dark ? 'bg-slate-700/60' : 'bg-slate-100'}>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Produto</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold">Qtd</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold">Preço Unit.</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold">Subtotal</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className={dark ? 'divide-y divide-slate-600' : 'divide-y divide-slate-200'}>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium">{item.productName}</td>
                      <td className="px-3 py-2">
                        <input type="number" min={1} max={item.stock ?? 999} value={item.qty_sent}
                          onChange={e => updateItem(idx, 'qty_sent', Math.max(1, parseInt(e.target.value) || 1))}
                          className={`w-16 text-center px-2 py-1 rounded border text-sm ${input}`}
                        />
                        {item.stock !== undefined && item.qty_sent > item.stock && (
                          <p className="text-red-500 text-xs mt-0.5">Excede estoque ({item.stock})</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min={0} value={item.agreed_unit_price}
                          onChange={e => updateItem(idx, 'agreed_unit_price', parseFloat(e.target.value) || 0)}
                          className={`w-24 text-center px-2 py-1 rounded border text-sm ${input}`}
                        />
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-blue-500">{fmt(item.qty_sent * item.agreed_unit_price)}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => removeItem(idx)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-right font-bold text-lg">Total: <span className="text-blue-500">{fmt(total)}</span></p>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          <div className={`rounded-lg border p-4 ${cardBg}`}>
            <h3 className="font-semibold mb-2">Consignatário</h3>
            <p className="text-sm">{selectedConsignee?.name}</p>
            <p className={`text-xs ${sub}`}>{selectedConsignee?.document} · Comissão: {selectedConsignee?.commission_rate}%</p>
          </div>
          <div className={`rounded-lg border p-4 ${cardBg}`}>
            <h3 className="font-semibold mb-2">Itens ({items.length})</h3>
            {items.map((item, idx) => (
              <div key={idx} className={`flex justify-between text-sm py-1 ${idx > 0 ? 'border-t ' + (dark ? 'border-slate-600' : 'border-slate-200') : ''}`}>
                <span>{item.productName} × {item.qty_sent}</span>
                <span className="font-semibold text-blue-500">{fmt(item.qty_sent * item.agreed_unit_price)}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 flex justify-between font-bold">
              <span>Total</span><span className="text-blue-500">{fmt(total)}</span>
            </div>
          </div>
          {dueDate && <p className={`text-sm ${sub}`}>Vencimento: {dueDate.split('-').reverse().join('/')}</p>}
          {notes && <p className={`text-sm ${sub}`}>Obs: {notes}</p>}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={() => step === 1 ? onClose() : setStep(step - 1)}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <ArrowLeft className="w-4 h-4" />{step === 1 ? 'Cancelar' : 'Voltar'}
        </button>
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)}
            disabled={step === 1 ? !selectedConsignee : items.length === 0}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors"
          >
            Próximo<ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Criar Remessa
          </button>
        )}
      </div>
    </Modal>
  );
}
